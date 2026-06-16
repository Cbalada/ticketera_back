import { Repository } from 'typeorm';
import { EventSector } from '../events/entities/event-sector.entity';
import { Event } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { Purchase } from '../purchases/entities/purchase.entity';
import { UpdatePricesDto } from '../events/dto/update-prices.dto';
export declare class AdminService {
    private readonly events;
    private readonly purchases;
    private readonly sectors;
    private readonly eventRepo;
    constructor(events: EventsService, purchases: Repository<Purchase>, sectors: Repository<EventSector>, eventRepo: Repository<Event>);
    updatePrices(eventId: number, dto: UpdatePricesDto): Promise<Event>;
    salesReport(): Promise<{
        totalSales: number;
        totalRevenue: number;
        ticketsSold: number;
        ticketsAvailable: number;
        salesByEvent: {
            eventId: number;
            title: string;
            sales: number;
            revenue: number;
            ticketsSold: number;
        }[];
        revenueByEvent: {
            eventId: number;
            title: string;
            revenue: number;
        }[];
        ticketsSoldBySector: {
            [k: string]: number;
        };
        topEvents: {
            eventId: number;
            title: string;
            sales: number;
            revenue: number;
            ticketsSold: number;
        }[];
    }>;
}
