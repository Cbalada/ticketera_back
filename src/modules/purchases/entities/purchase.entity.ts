import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { PurchaseStatus } from '../../../common/enums/purchase-status.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('purchases')
@Unique(['reservationId'])
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.purchases)
  user: User;

  @Column()
  reservationId: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.purchases)
  reservation: Reservation;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({ type: 'enum', enum: PurchaseStatus })
  status: PurchaseStatus;

  @CreateDateColumn()
  createdAt: Date;
}
