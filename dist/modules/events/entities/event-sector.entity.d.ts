import { Sector } from '../../../common/enums/sector.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { StockMovement } from '../../stock/entities/stock-movement.entity';
import { Event } from './event.entity';
export declare class EventSector {
    id: number;
    eventId: number;
    event: Event;
    sector: Sector;
    price: string;
    capacity: number;
    availableQuantity: number;
    reservations: Reservation[];
    stockMovements: StockMovement[];
}
