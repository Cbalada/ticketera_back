import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseStatus } from '../../common/enums/purchase-status.enum';
import { EventSector } from '../events/entities/event-sector.entity';
import { Event } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { Purchase } from '../purchases/entities/purchase.entity';
import { UpdatePricesDto } from '../events/dto/update-prices.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly events: EventsService,
    @InjectRepository(Purchase) private readonly purchases: Repository<Purchase>,
    @InjectRepository(EventSector) private readonly sectors: Repository<EventSector>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>
  ) {}

  updatePrices(eventId: number, dto: UpdatePricesDto) {
    return this.events.updatePrices(eventId, dto);
  }

  async salesReport() {
    const [purchases, sectors, events] = await Promise.all([
      this.purchases.find({
        where: { status: PurchaseStatus.SUCCESS },
        relations: { reservation: { eventSector: { event: true } } }
      }),
      this.sectors.find(),
      this.eventRepo.find()
    ]);

    const totalSales = purchases.length;
    const totalRevenue = purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount), 0);
    const ticketsSold = purchases.reduce((sum, purchase) => sum + purchase.reservation.quantity, 0);
    const ticketsAvailable = sectors.reduce((sum, sector) => sum + sector.availableQuantity, 0);
    const byEvent = new Map<number, { eventId: number; title: string; sales: number; revenue: number; ticketsSold: number }>();
    const bySector = new Map<string, number>();

    for (const event of events) {
      byEvent.set(event.id, { eventId: event.id, title: event.title, sales: 0, revenue: 0, ticketsSold: 0 });
    }
    for (const purchase of purchases) {
      const reservation = purchase.reservation;
      const event = reservation.eventSector.event;
      const eventReport = byEvent.get(event.id) ?? { eventId: event.id, title: event.title, sales: 0, revenue: 0, ticketsSold: 0 };
      eventReport.sales += 1;
      eventReport.revenue += Number(purchase.totalAmount);
      eventReport.ticketsSold += reservation.quantity;
      byEvent.set(event.id, eventReport);
      bySector.set(reservation.eventSector.sector, (bySector.get(reservation.eventSector.sector) ?? 0) + reservation.quantity);
    }

    const salesByEvent = [...byEvent.values()];
    return {
      totalSales,
      totalRevenue,
      ticketsSold,
      ticketsAvailable,
      salesByEvent,
      revenueByEvent: salesByEvent.map(({ eventId, title, revenue }) => ({ eventId, title, revenue })),
      ticketsSoldBySector: Object.fromEntries(bySector),
      topEvents: [...salesByEvent].sort((a, b) => b.ticketsSold - a.ticketsSold).slice(0, 5)
    };
  }
}
