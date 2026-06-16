import { PurchaseStatus } from '../../../common/enums/purchase-status.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { User } from '../../users/entities/user.entity';
export declare class Purchase {
    id: number;
    userId: number;
    user: User;
    reservationId: number;
    reservation: Reservation;
    totalAmount: string;
    status: PurchaseStatus;
    createdAt: Date;
}
