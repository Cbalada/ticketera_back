import { ReservationStatus } from '../../../common/enums/reservation-status.enum';
import { EventSector } from '../../events/entities/event-sector.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { User } from '../../users/entities/user.entity';
export declare class Reservation {
    id: number;
    userId: number;
    user: User;
    eventSectorId: number;
    eventSector: EventSector;
    quantity: number;
    status: ReservationStatus;
    expiresAt: Date;
    purchases: Purchase[];
    createdAt: Date;
}
