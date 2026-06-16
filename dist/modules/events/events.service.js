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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_not_found_exception_1 = require("../../common/exceptions/event-not-found.exception");
const stock_movement_type_enum_1 = require("../../common/enums/stock-movement-type.enum");
const stock_movement_entity_1 = require("../stock/entities/stock-movement.entity");
const event_sector_entity_1 = require("./entities/event-sector.entity");
const event_entity_1 = require("./entities/event.entity");
let EventsService = class EventsService {
    constructor(events, sectors, movements) {
        this.events = events;
        this.sectors = sectors;
        this.movements = movements;
    }
    findAll() {
        return this.events.find({ relations: { sectors: true }, order: { date: 'ASC' } });
    }
    async findOne(id) {
        const event = await this.events.findOne({ where: { id }, relations: { sectors: true } });
        if (!event) {
            throw new event_not_found_exception_1.EventNotFoundException();
        }
        return event;
    }
    async create(dto) {
        const event = this.events.create({
            title: dto.title,
            description: dto.description,
            imageUrl: dto.imageUrl,
            date: new Date(dto.date),
            sectors: dto.sectors.map((sector) => this.sectors.create({
                sector: sector.sector,
                price: sector.price.toFixed(2),
                capacity: sector.capacity,
                availableQuantity: sector.capacity
            }))
        });
        return this.events.save(event);
    }
    async update(id, dto) {
        const event = await this.findOne(id);
        Object.assign(event, {
            ...dto,
            date: dto.date ? new Date(dto.date) : event.date
        });
        if (dto.sectors) {
            const existingSectors = await this.sectors.find({ where: { eventId: id } });
            const existingMap = new Map();
            existingSectors.forEach((es) => existingMap.set(es.sector, es));
            const updatedSectors = [];
            for (const s of dto.sectors) {
                const match = existingMap.get(s.sector);
                if (match) {
                    const oldCapacity = match.capacity;
                    const newCapacity = s.capacity;
                    match.price = s.price.toFixed(2);
                    match.capacity = newCapacity;
                    const diff = newCapacity - oldCapacity;
                    match.availableQuantity = Math.min(newCapacity, Math.max(0, match.availableQuantity + diff));
                    updatedSectors.push(match);
                    existingMap.delete(s.sector);
                }
                else {
                    updatedSectors.push(this.sectors.create({
                        eventId: id,
                        sector: s.sector,
                        price: s.price.toFixed(2),
                        capacity: s.capacity,
                        availableQuantity: s.capacity
                    }));
                }
            }
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
    async remove(id) {
        await this.findOne(id);
        await this.events.delete(id);
        return { success: true };
    }
    async updatePrices(eventId, dto) {
        await this.findOne(eventId);
        for (const price of dto.prices) {
            const result = await this.sectors.update({ eventId, sector: price.sector }, { price: price.price.toFixed(2) });
            if (result.affected) {
                const sector = await this.sectors.findOneByOrFail({ eventId, sector: price.sector });
                await this.movements.save(this.movements.create({
                    eventSectorId: sector.id,
                    type: stock_movement_type_enum_1.StockMovementType.ADMIN_ADJUSTMENT,
                    quantity: 0
                }));
            }
        }
        return this.findOne(eventId);
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(event_sector_entity_1.EventSector)),
    __param(2, (0, typeorm_1.InjectRepository)(stock_movement_entity_1.StockMovement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map