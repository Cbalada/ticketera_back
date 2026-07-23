import { DataSource, Repository } from 'typeorm';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
export declare class ReservationsService {
    private readonly dataSource;
    private readonly realtime;
    private readonly reservations;
    constructor(dataSource: DataSource, realtime: RealtimeService, reservations: Repository<Reservation>);
    create(userId: number, dto: CreateReservationDto): Promise<Reservation>;
    myReservations(userId: number): Promise<Reservation[]>;
    expireReservations(): Promise<void>;
    cancel(userId: number, reservationId: number): Promise<Reservation | undefined>;
    private expireOne;
    private releaseOne;
}
