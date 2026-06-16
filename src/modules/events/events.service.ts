import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventNotFoundException } from '../../common/exceptions/event-not-found.exception';
import { StockMovementType } from '../../common/enums/stock-movement-type.enum';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdatePricesDto } from './dto/update-prices.dto';
import { EventSector } from './entities/event-sector.entity';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    @InjectRepository(EventSector) private readonly sectors: Repository<EventSector>,
    @InjectRepository(StockMovement) private readonly movements: Repository<StockMovement>
  ) {}

  findAll() {
    return this.events.find({ relations: { sectors: true }, order: { date: 'ASC' } });
  }

  async findOne(id: number) {
    const event = await this.events.findOne({ where: { id }, relations: { sectors: true } });
    if (!event) {
      throw new EventNotFoundException();
    }
    return event;
  }

  async create(dto: CreateEventDto) {
    const event = this.events.create({
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      date: new Date(dto.date),
      sectors: dto.sectors.map((sector) =>
        this.sectors.create({
          sector: sector.sector,
          price: sector.price.toFixed(2),
          capacity: sector.capacity,
          availableQuantity: sector.capacity
        })
      )
    });
    return this.events.save(event);
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    Object.assign(event, {
      ...dto,
      date: dto.date ? new Date(dto.date) : event.date
    });

    if (dto.sectors) {
      const existingSectors = await this.sectors.find({ where: { eventId: id } });
      const existingMap = new Map<string | number, EventSector>();
      existingSectors.forEach((es) => existingMap.set(es.sector, es));

      const updatedSectors: EventSector[] = [];

      for (const s of dto.sectors) {
        const match = existingMap.get(s.sector as any);
        if (match) {
          const oldCapacity = match.capacity;
          const newCapacity = s.capacity;
          match.price = s.price.toFixed(2);
          match.capacity = newCapacity;
          const diff = newCapacity - oldCapacity;
          match.availableQuantity = Math.min(newCapacity, Math.max(0, match.availableQuantity + diff));
          updatedSectors.push(match);
          existingMap.delete(s.sector as any);
        } else {
          updatedSectors.push(
            this.sectors.create({
              eventId: id,
              sector: s.sector,
              price: s.price.toFixed(2),
              capacity: s.capacity,
              availableQuantity: s.capacity
            })
          );
        }
      }

      // remove sectors that were not included in the update payload
      if (existingMap.size) {
        const toDelete = Array.from(existingMap.values()).map((e) => e.id);
        if (toDelete.length) {
          await this.sectors.delete(toDelete);
        }
      }

      event.sectors = updatedSectors;
    }

    return this.events.save(event);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.events.delete(id);
    return { success: true };
  }

  async updatePrices(eventId: number, dto: UpdatePricesDto) {
    await this.findOne(eventId);
    for (const price of dto.prices) {
      const result = await this.sectors.update({ eventId, sector: price.sector }, { price: price.price.toFixed(2) });
      if (result.affected) {
        const sector = await this.sectors.findOneByOrFail({ eventId, sector: price.sector });
        await this.movements.save(
          this.movements.create({
            eventSectorId: sector.id,
            type: StockMovementType.ADMIN_ADJUSTMENT,
            quantity: 0
          })
        );
      }
    }
    return this.findOne(eventId);
  }
}
