import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InsufficientStockException } from '../../common/exceptions/insufficient-stock.exception';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';
import { Sector } from '../../common/enums/sector.enum';
import { StockMovementType } from '../../common/enums/stock-movement-type.enum';
import { RealtimeService } from '../realtime/realtime.service';
import { Reservation } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  it('rolls back and throws when stock is insufficient', async () => {
    const rollbackTransaction = jest.fn();
    const release = jest.fn();
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction,
      release,
      manager: {
        findOne: jest.fn().mockResolvedValue({
          id: 1,
          eventId: 1,
          sector: Sector.VIP,
          availableQuantity: 1
        })
      }
    };
    const module = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: DataSource, useValue: { createQueryRunner: () => queryRunner } },
        { provide: RealtimeService, useValue: { stockUpdated: jest.fn(), reservationCreated: jest.fn() } },
        { provide: getRepositoryToken(Reservation), useValue: {} }
      ]
    })
      .compile();

    await expect(module.get(ReservationsService).create(1, { eventSectorId: 1, quantity: 2 })).rejects.toBeInstanceOf(
      InsufficientStockException
    );
    expect(rollbackTransaction).toHaveBeenCalled();
    expect(release).toHaveBeenCalled();
  });

  it('cancels a pending reservation and releases stock immediately', async () => {
    const reservation = {
      id: 7,
      userId: 1,
      eventSectorId: 3,
      quantity: 2,
      status: ReservationStatus.PENDING,
      expiresAt: new Date(Date.now() + 60_000)
    };
    const sector = {
      id: 3,
      eventId: 9,
      sector: Sector.VIP,
      availableQuantity: 4
    };
    const commitTransaction = jest.fn();
    const rollbackTransaction = jest.fn();
    const release = jest.fn();
    const save = jest.fn();
    const create = jest.fn((_entity, value) => value);
    const queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction,
      rollbackTransaction,
      release,
      manager: {
        findOne: jest.fn().mockResolvedValue(reservation),
        findOneOrFail: jest.fn().mockResolvedValue(sector),
        save,
        create
      }
    };
    const realtime = {
      stockUpdated: jest.fn(),
      reservationCreated: jest.fn(),
      reservationExpired: jest.fn()
    };
    const module = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: DataSource, useValue: { createQueryRunner: () => queryRunner } },
        { provide: RealtimeService, useValue: realtime },
        { provide: getRepositoryToken(Reservation), useValue: {} }
      ]
    }).compile();

    await expect(module.get(ReservationsService).cancel(1, reservation.id)).resolves.toMatchObject({
      id: reservation.id,
      status: ReservationStatus.EXPIRED
    });

    expect(sector.availableQuantity).toBe(6);
    expect(save).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        eventSectorId: sector.id,
        type: StockMovementType.RESERVATION_EXPIRED,
        quantity: reservation.quantity
      })
    );
    expect(commitTransaction).toHaveBeenCalled();
    expect(rollbackTransaction).not.toHaveBeenCalled();
    expect(realtime.stockUpdated).toHaveBeenCalledWith({
      eventId: sector.eventId,
      sector: sector.sector,
      availableQuantity: sector.availableQuantity
    });
    expect(realtime.reservationExpired).toHaveBeenCalledWith(
      sector.eventId,
      expect.objectContaining({
        reservationId: reservation.id,
        availableQuantity: sector.availableQuantity
      })
    );
    expect(release).toHaveBeenCalled();
  });
});
