import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
export declare class EventsController {
    private readonly events;
    constructor(events: EventsService);
    findAll(): Promise<import("./entities/event.entity").Event[]>;
    findOne(id: number): Promise<import("./entities/event.entity").Event>;
    create(dto: CreateEventDto): Promise<import("./entities/event.entity").Event>;
    update(id: number, dto: UpdateEventDto): Promise<import("./entities/event.entity").Event>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
