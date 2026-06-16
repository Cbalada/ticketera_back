import { UpdatePricesDto } from '../events/dto/update-prices.dto';
import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly admin;
    constructor(admin: AdminService);
    updatePrices(eventId: number, dto: UpdatePricesDto): Promise<import("../events/entities/event.entity").Event>;
    sales(): Promise<{
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
