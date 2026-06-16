import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stadiums')
export class Stadium {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  totalCapacity: number;

  @Column({ type: 'jsonb' })
  sectorCapacities: Record<string, number>;
}
