import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSector } from '../events/entities/event-sector.entity';
import { Event } from '../events/entities/event.entity';
import { EventsModule } from '../events/events.module';
import { Purchase } from '../purchases/entities/purchase.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [EventsModule, TypeOrmModule.forFeature([Purchase, EventSector, Event])],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
