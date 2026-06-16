import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StockMovementType } from '../../../common/enums/stock-movement-type.enum';
import { EventSector } from '../../events/entities/event-sector.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventSectorId: number;

  @ManyToOne(() => EventSector, (sector) => sector.stockMovements)
  eventSector: EventSector;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}
