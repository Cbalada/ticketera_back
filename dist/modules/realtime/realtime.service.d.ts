import { Sector } from '../../common/enums/sector.enum';
import { RealtimeGateway } from './realtime.gateway';
interface StockPayload {
    eventId: number;
    sector: Sector;
    availableQuantity: number;
}
export declare class RealtimeService {
    private readonly gateway;
    constructor(gateway: RealtimeGateway);
    stockUpdated(payload: StockPayload): void;
    reservationCreated(eventId: number, payload: unknown): void;
    reservationExpired(eventId: number, payload: unknown): void;
    purchaseCompleted(eventId: number, payload: unknown): void;
    private emit;
}
export {};
