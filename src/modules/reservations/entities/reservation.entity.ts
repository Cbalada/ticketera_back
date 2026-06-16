import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ReservationStatus } from '../../../common/enums/reservation-status.enum';
import { EventSector } from '../../events/entities/event-sector.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @Column()
  eventSectorId: number;

  @ManyToOne(() => EventSector, (sector) => sector.reservations)
  eventSector: EventSector;

  @Column()
  quantity: number;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.PENDING })
  status: ReservationStatus;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @OneToMany(() => Purchase, (purchase) => purchase.reservation)
  purchases: Purchase[];

  @CreateDateColumn()
  createdAt: Date;
}
