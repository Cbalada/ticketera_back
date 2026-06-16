import { Repository } from 'typeorm';
import { StockMovement } from '../stock/entities/stock-movement.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdatePricesDto } from './dto/update-prices.dto';
import { EventSector } from './entities/event-sector.entity';
import { Event } from './entities/event.entity';
export declare class EventsService {
    private readonly events;
    private readonly sectors;
    private readonly movements;
    constructor(events: Repository<Event>, sectors: Repository<EventSector>, movements: Repository<StockMovement>);
    findAll(): Promise<Event[]>;
    findOne(id: number): Promise<Event>;
    create(dto: CreateEventDto): Promise<Event>;
    update(id: number, dto: UpdateEventDto): Promise<Event>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    updatePrices(eventId: number, dto: UpdatePricesDto): Promise<Event>;
}
