import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { Stadium } from '../stadium/entities/stadium.entity';
import { EventSector } from './entities/event-sector.entity';
import { Event } from './entities/event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventSector, StockMovement, Stadium])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService, TypeOrmModule]
})
export class EventsModule {}
