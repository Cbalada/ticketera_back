"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_status_enum_1 = require("../../common/enums/purchase-status.enum");
const event_sector_entity_1 = require("../events/entities/event-sector.entity");
const event_entity_1 = require("../events/entities/event.entity");
const events_service_1 = require("../events/events.service");
const purchase_entity_1 = require("../purchases/entities/purchase.entity");
let AdminService = class AdminService {
    constructor(events, purchases, sectors, eventRepo) {
        this.events = events;
        this.purchases = purchases;
        this.sectors = sectors;
        this.eventRepo = eventRepo;
    }
    updatePrices(eventId, dto) {
        return this.events.updatePrices(eventId, dto);
    }
    async salesReport() {
        const [purchases, sectors, events] = await Promise.all([
            this.purchases.find({
                where: { status: purchase_status_enum_1.PurchaseStatus.SUCCESS },
                relations: { reservation: { eventSector: { event: true } } }
            }),
            this.sectors.find(),
            this.eventRepo.find()
        ]);
        const totalSales = purchases.length;
        const totalRevenue = purchases.reduce((sum, purchase) => sum + Number(purchase.totalAmount), 0);
        const ticketsSold = purchases.reduce((sum, purchase) => sum + purchase.reservation.quantity, 0);
        const ticketsAvailable = sectors.reduce((sum, sector) => sum + sector.availableQuantity, 0);
        const byEvent = new Map();
        const bySector = new Map();
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_entity_1.Purchase)),
    __param(2, (0, typeorm_1.InjectRepository)(event_sector_entity_1.EventSector)),
    __param(3, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map