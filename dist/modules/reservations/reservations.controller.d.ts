import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservations;
    constructor(reservations: ReservationsService);
    create(user: JwtPayload, dto: CreateReservationDto): Promise<import("./entities/reservation.entity").Reservation>;
    mine(user: JwtPayload): Promise<import("./entities/reservation.entity").Reservation[]>;
    cancel(user: JwtPayload, id: number): Promise<import("./entities/reservation.entity").Reservation | undefined>;
}
