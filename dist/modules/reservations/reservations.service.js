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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const insufficient_stock_exception_1 = require("../../common/exceptions/insufficient-stock.exception");
const reservation_status_enum_1 = require("../../common/enums/reservation-status.enum");
const stock_movement_type_enum_1 = require("../../common/enums/stock-movement-type.enum");
const event_sector_entity_1 = require("../events/entities/event-sector.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const stock_movement_entity_1 = require("../stock/entities/stock-movement.entity");
const reservation_entity_1 = require("./entities/reservation.entity");
const RESERVATION_TTL_MS = 5 * 60 * 1000;
let ReservationsService = class ReservationsService {
    constructor(dataSource, realtime, reservations) {
        this.dataSource = dataSource;
        this.realtime = realtime;
        this.reservations = reservations;
    }
    async create(userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const sector = await queryRunner.manager.findOne(event_sector_entity_1.EventSector, {
                where: { id: dto.eventSectorId },
                lock: { mode: 'pessimistic_write' }
            });
            if (!sector) {
                throw new common_1.NotFoundException('Event sector not found');
            }
            if (sector.availableQuantity < dto.quantity) {
                throw new insufficient_stock_exception_1.InsufficientStockException();
            }
            sector.availableQuantity -= dto.quantity;
            await queryRunner.manager.save(event_sector_entity_1.EventSector, sector);
            const reservation = await queryRunner.manager.save(reservation_entity_1.Reservation, queryRunner.manager.create(reservation_entity_1.Reservation, {
                userId,
                eventSectorId: sector.id,
                quantity: dto.quantity,
                status: reservation_status_enum_1.ReservationStatus.PENDING,
                expiresAt: new Date(Date.now() + RESERVATION_TTL_MS)
            }));
            await queryRunner.manager.save(stock_movement_entity_1.StockMovement, queryRunner.manager.create(stock_movement_entity_1.StockMovement, {
                eventSectorId: sector.id,
                type: stock_movement_type_enum_1.StockMovementType.RESERVATION_CREATED,
                quantity: dto.quantity
            }));
            await queryRunner.commitTransaction();
            const payload = {
                eventId: sector.eventId,
                sector: sector.sector,
                availableQuantity: sector.availableQuantity
            };
            this.realtime.stockUpdated(payload);
            this.realtime.reservationCreated(sector.eventId, { reservationId: reservation.id, ...payload });
            return reservation;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    myReservations(userId) {
        return this.reservations.find({
            where: { userId },
            relations: { eventSector: { event: true } },
            order: { createdAt: 'DESC' }
        });
    }
    async expireReservations() {
        const expired = await this.reservations.find({
            where: { status: reservation_status_enum_1.ReservationStatus.PENDING, expiresAt: (0, typeorm_2.LessThanOrEqual)(new Date()) },
            select: { id: true }
        });
        for (const reservation of expired) {
            await this.expireOne(reservation.id);
        }
    }
    async cancel(userId, reservationId) {
        return this.releaseOne(reservationId, {
            userId,
            ignoreExpiresAt: true
        });
    }
    async expireOne(reservationId) {
        await this.releaseOne(reservationId, {
            ignoreExpiresAt: false
        });
    }
    async releaseOne(reservationId, options) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const reservation = await queryRunner.manager.findOne(reservation_entity_1.Reservation, {
                where: { id: reservationId },
                lock: { mode: 'pessimistic_write' }
            });
            if (!reservation) {
                if (options.userId === undefined) {
                    await queryRunner.rollbackTransaction();
                    return;
                }
                throw new common_1.NotFoundException('Reservation not found');
            }
            if (options.userId !== undefined && reservation.userId !== options.userId) {
                throw new common_1.ForbiddenException('Reservation does not belong to user');
            }
            if (reservation.status !== reservation_status_enum_1.ReservationStatus.PENDING ||
                (!options.ignoreExpiresAt && reservation.expiresAt > new Date())) {
                await queryRunner.rollbackTransaction();
                return reservation;
            }
            const sector = await queryRunner.manager.findOneOrFail(event_sector_entity_1.EventSector, {
                where: { id: reservation.eventSectorId },
                lock: { mode: 'pessimistic_write' }
            });
            reservation.status = reservation_status_enum_1.ReservationStatus.EXPIRED;
            sector.availableQuantity += reservation.quantity;
            await queryRunner.manager.save(reservation);
            await queryRunner.manager.save(sector);
            await queryRunner.manager.save(stock_movement_entity_1.StockMovement, queryRunner.manager.create(stock_movement_entity_1.StockMovement, {
                eventSectorId: sector.id,
                type: stock_movement_type_enum_1.StockMovementType.RESERVATION_EXPIRED,
                quantity: reservation.quantity
            }));
            await queryRunner.commitTransaction();
            const payload = { eventId: sector.eventId, sector: sector.sector, availableQuantity: sector.availableQuantity };
            this.realtime.stockUpdated(payload);
            this.realtime.reservationExpired(sector.eventId, { reservationId, ...payload });
            return reservation;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.ReservationsService = ReservationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservationsService.prototype, "expireReservations", null);
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        realtime_service_1.RealtimeService,
        typeorm_2.Repository])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map