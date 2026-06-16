import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Sector } from '../../../common/enums/sector.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { StockMovement } from '../../stock/entities/stock-movement.entity';
import { Event } from './event.entity';

@Entity('event_sectors')
@Unique(['eventId', 'sector'])
export class EventSector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @ManyToOne(() => Event, (event) => event.sectors, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ type: 'enum', enum: Sector })
  sector: Sector;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Column()
  capacity: number;

  @Column()
  availableQuantity: number;

  @OneToMany(() => Reservation, (reservation) => reservation.eventSector)
  reservations: Reservation[];

  @OneToMany(() => StockMovement, (movement) => movement.eventSector)
  stockMovements: StockMovement[];
}
