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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const purchase_already_completed_exception_1 = require("../../common/exceptions/purchase-already-completed.exception");
const reservation_expired_exception_1 = require("../../common/exceptions/reservation-expired.exception");
const purchase_status_enum_1 = require("../../common/enums/purchase-status.enum");
const reservation_status_enum_1 = require("../../common/enums/reservation-status.enum");
const stock_movement_type_enum_1 = require("../../common/enums/stock-movement-type.enum");
const event_sector_entity_1 = require("../events/entities/event-sector.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const reservation_entity_1 = require("../reservations/entities/reservation.entity");
const stock_movement_entity_1 = require("../stock/entities/stock-movement.entity");
const purchase_entity_1 = require("./entities/purchase.entity");
let PurchasesService = class PurchasesService {
    constructor(dataSource, realtime) {
        this.dataSource = dataSource;
        this.realtime = realtime;
    }
    async create(userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const reservation = await queryRunner.manager.findOne(reservation_entity_1.Reservation, {
                where: { id: dto.reservationId },
                lock: { mode: 'pessimistic_write' }
            });
            if (!reservation) {
                throw new common_1.NotFoundException('Reservation not found');
            }
            if (reservation.userId !== userId) {
                throw new common_1.ForbiddenException('Reservation does not belong to user');
            }
            if (reservation.status === reservation_status_enum_1.ReservationStatus.PURCHASED) {
                throw new purchase_already_completed_exception_1.PurchaseAlreadyCompletedException();
            }
            if (reservation.status === reservation_status_enum_1.ReservationStatus.EXPIRED || reservation.expiresAt <= new Date()) {
                throw new reservation_expired_exception_1.ReservationExpiredException();
            }
            const existing = await queryRunner.manager.findOne(purchase_entity_1.Purchase, {
                where: { reservationId: reservation.id },
                lock: { mode: 'pessimistic_write' }
            });
            if (existing) {
                throw new purchase_already_completed_exception_1.PurchaseAlreadyCompletedException();
            }
            const sector = await queryRunner.manager.findOneOrFail(event_sector_entity_1.EventSector, {
                where: { id: reservation.eventSectorId },
                lock: { mode: 'pessimistic_write' }
            });
            const totalAmount = (Number(sector.price) * reservation.quantity).toFixed(2);
            reservation.status = reservation_status_enum_1.ReservationStatus.PURCHASED;
            const purchase = await queryRunner.manager.save(purchase_entity_1.Purchase, queryRunner.manager.create(purchase_entity_1.Purchase, {
                userId,
                reservationId: reservation.id,
                totalAmount,
                status: purchase_status_enum_1.PurchaseStatus.SUCCESS
            }));
            await queryRunner.manager.save(reservation_entity_1.Reservation, reservation);
            await queryRunner.manager.save(stock_movement_entity_1.StockMovement, queryRunner.manager.create(stock_movement_entity_1.StockMovement, {
                eventSectorId: sector.id,
                type: stock_movement_type_enum_1.StockMovementType.PURCHASE_COMPLETED,
                quantity: reservation.quantity
            }));
            await queryRunner.commitTransaction();
            this.realtime.purchaseCompleted(sector.eventId, { purchaseId: purchase.id, reservationId: reservation.id });
            return purchase;
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
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource, realtime_service_1.RealtimeService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map