import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSector } from '../events/entities/event-sector.entity';
import { RealtimeModule } from '../realtime/realtime.module';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, EventSector, StockMovement]), RealtimeModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService, TypeOrmModule]
})
export class ReservationsModule {}
