import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchaseAlreadyCompletedException } from '../../common/exceptions/purchase-already-completed.exception';
import { ReservationExpiredException } from '../../common/exceptions/reservation-expired.exception';
import { PurchaseStatus } from '../../common/enums/purchase-status.enum';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';
import { StockMovementType } from '../../common/enums/stock-movement-type.enum';
import { EventSector } from '../events/entities/event-sector.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { Reservation } from '../reservations/entities/reservation.entity';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Purchase } from './entities/purchase.entity';

@Injectable()
export class PurchasesService {
  constructor(private readonly dataSource: DataSource, private readonly realtime: RealtimeService) {}

  async create(userId: number, dto: CreatePurchaseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reservation = await queryRunner.manager.findOne(Reservation, {
        where: { id: dto.reservationId },
        lock: { mode: 'pessimistic_write' }
      });
      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }
      if (reservation.userId !== userId) {
        throw new ForbiddenException('Reservation does not belong to user');
      }
      if (reservation.status === ReservationStatus.PURCHASED) {
        throw new PurchaseAlreadyCompletedException();
      }
      if (reservation.status === ReservationStatus.EXPIRED || reservation.expiresAt <= new Date()) {
        throw new ReservationExpiredException();
      }

      const existing = await queryRunner.manager.findOne(Purchase, {
        where: { reservationId: reservation.id },
        lock: { mode: 'pessimistic_write' }
      });
      if (existing) {
        throw new PurchaseAlreadyCompletedException();
      }

      const sector = await queryRunner.manager.findOneOrFail(EventSector, {
        where: { id: reservation.eventSectorId },
        lock: { mode: 'pessimistic_write' }
      });
      const totalAmount = (Number(sector.price) * reservation.quantity).toFixed(2);
      reservation.status = ReservationStatus.PURCHASED;

      const purchase = await queryRunner.manager.save(
        Purchase,
        queryRunner.manager.create(Purchase, {
          userId,
          reservationId: reservation.id,
          totalAmount,
          status: PurchaseStatus.SUCCESS
        })
      );
      await queryRunner.manager.save(Reservation, reservation);
      await queryRunner.manager.save(
        StockMovement,
        queryRunner.manager.create(StockMovement, {
          eventSectorId: sector.id,
          type: StockMovementType.PURCHASE_COMPLETED,
          quantity: reservation.quantity
        })
      );

      await queryRunner.commitTransaction();
      this.realtime.purchaseCompleted(sector.eventId, { purchaseId: purchase.id, reservationId: reservation.id });
      return purchase;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
