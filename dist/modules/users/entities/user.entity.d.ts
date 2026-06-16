import { UserRole } from '../../../common/enums/user-role.enum';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    refreshTokenHash: string | null;
    reservations: Reservation[];
    purchases: Purchase[];
    createdAt: Date;
    updatedAt: Date;
}
