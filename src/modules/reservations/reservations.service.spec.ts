import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InsufficientStockException } from '../../common/exceptions/insufficient-stock.exception';
import { Sector } from '../../common/enums/sector.enum';
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
});
