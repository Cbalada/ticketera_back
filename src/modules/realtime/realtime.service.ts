import { Injectable } from '@nestjs/common';
import { Sector } from '../../common/enums/sector.enum';
import { RealtimeGateway } from './realtime.gateway';

interface StockPayload {
  eventId: number;
  sector: Sector;
  availableQuantity: number;
}

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  stockUpdated(payload: StockPayload) {
    this.emit(payload.eventId, 'stock.updated', payload);
  }

  reservationCreated(eventId: number, payload: unknown) {
    this.emit(eventId, 'reservation.created', payload);
  }

  reservationExpired(eventId: number, payload: unknown) {
    this.emit(eventId, 'reservation.expired', payload);
  }

  purchaseCompleted(eventId: number, payload: unknown) {
    this.emit(eventId, 'purchase.completed', payload);
  }

  private emit(eventId: number, event: string, payload: unknown) {
    this.gateway.server?.to(`event:${eventId}`).emit(event, payload);
  }
}
