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
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const realtime_gateway_1 = require("./realtime.gateway");
let RealtimeService = class RealtimeService {
    constructor(gateway) {
        this.gateway = gateway;
    }
    stockUpdated(payload) {
        this.emit(payload.eventId, 'stock.updated', payload);
    }
    reservationCreated(eventId, payload) {
        this.emit(eventId, 'reservation.created', payload);
    }
    reservationExpired(eventId, payload) {
        this.emit(eventId, 'reservation.expired', payload);
    }
    purchaseCompleted(eventId, payload) {
        this.emit(eventId, 'purchase.completed', payload);
    }
    emit(eventId, event, payload) {
        this.gateway.server?.to(`event:${eventId}`).emit(event, payload);
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway])
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map