import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSector } from '../events/entities/event-sector.entity';
import { RealtimeModule } from '../realtime/realtime.module';
import { Reservation } from '../reservations/entities/reservation.entity';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Reservation, EventSector, StockMovement]), RealtimeModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService, TypeOrmModule]
})
export class PurchasesModule {}
