import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { InsufficientStockException } from '../../common/exceptions/insufficient-stock.exception';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';
import { StockMovementType } from '../../common/enums/stock-movement-type.enum';
import { EventSector } from '../events/entities/event-sector.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';

const RESERVATION_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly realtime: RealtimeService,
    @InjectRepository(Reservation) private readonly reservations: Repository<Reservation>
  ) {}

  async create(userId: number, dto: CreateReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sector = await queryRunner.manager.findOne(EventSector, {
        where: { id: dto.eventSectorId },
        lock: { mode: 'pessimistic_write' }
      });
      if (!sector) {
        throw new NotFoundException('Event sector not found');
      }
      if (sector.availableQuantity < dto.quantity) {
        throw new InsufficientStockException();
      }

      sector.availableQuantity -= dto.quantity;
      await queryRunner.manager.save(EventSector, sector);

      const reservation = await queryRunner.manager.save(
        Reservation,
        queryRunner.manager.create(Reservation, {
          userId,
          eventSectorId: sector.id,
          quantity: dto.quantity,
          status: ReservationStatus.PENDING,
          expiresAt: new Date(Date.now() + RESERVATION_TTL_MS)
        })
      );

      await queryRunner.manager.save(
        StockMovement,
        queryRunner.manager.create(StockMovement, {
          eventSectorId: sector.id,
          type: StockMovementType.RESERVATION_CREATED,
          quantity: dto.quantity
        })
      );

      await queryRunner.commitTransaction();
      const payload = {
        eventId: sector.eventId,
        sector: sector.sector,
        availableQuantity: sector.availableQuantity
      };
      this.realtime.stockUpdated(payload);
      this.realtime.reservationCreated(sector.eventId, { reservationId: reservation.id, ...payload });
      return reservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  myReservations(userId: number) {
    return this.reservations.find({
      where: { userId },
      relations: { eventSector: { event: true } },
      order: { createdAt: 'DESC' }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expireReservations() {
    const expired = await this.reservations.find({
      where: { status: ReservationStatus.PENDING, expiresAt: LessThanOrEqual(new Date()) },
      select: { id: true }
    });
    for (const reservation of expired) {
      await this.expireOne(reservation.id);
    }
  }

  private async expireOne(reservationId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reservation = await queryRunner.manager.findOne(Reservation, {
        where: { id: reservationId },
        lock: { mode: 'pessimistic_write' }
      });
      if (!reservation || reservation.status !== ReservationStatus.PENDING || reservation.expiresAt > new Date()) {
        await queryRunner.rollbackTransaction();
        return;
      }
      const sector = await queryRunner.manager.findOneOrFail(EventSector, {
        where: { id: reservation.eventSectorId },
        lock: { mode: 'pessimistic_write' }
      });
      reservation.status = ReservationStatus.EXPIRED;
      sector.availableQuantity += reservation.quantity;

      await queryRunner.manager.save(reservation);
      await queryRunner.manager.save(sector);
      await queryRunner.manager.save(
        StockMovement,
        queryRunner.manager.create(StockMovement, {
          eventSectorId: sector.id,
          type: StockMovementType.RESERVATION_EXPIRED,
          quantity: reservation.quantity
        })
      );

      await queryRunner.commitTransaction();
      const payload = { eventId: sector.eventId, sector: sector.sector, availableQuantity: sector.availableQuantity };
      this.realtime.stockUpdated(payload);
      this.realtime.reservationExpired(sector.eventId, { reservationId, ...payload });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
