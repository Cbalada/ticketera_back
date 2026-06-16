import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Sector } from '../common/enums/sector.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { EventSector } from '../modules/events/entities/event-sector.entity';
import { Event } from '../modules/events/entities/event.entity';
import { Purchase } from '../modules/purchases/entities/purchase.entity';
import { Reservation } from '../modules/reservations/entities/reservation.entity';
import { Stadium } from '../modules/stadium/entities/stadium.entity';
import { StockMovement } from '../modules/stock/entities/stock-movement.entity';
import { User } from '../modules/users/entities/user.entity';

const sectorCapacities: Record<Sector, number> = {
  [Sector.VIP]: 1000,
  [Sector.CAMPO]: 2000,
  [Sector.PLATEA_A]: 1500,
  [Sector.PLATEA_B]: 1500
};

dotenv.config();
dotenv.config({ path: '.env.example' });

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

const dataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  host: databaseUrl ? undefined : process.env.DATABASE_HOST ?? process.env.PGHOST ?? process.env.POSTGRES_HOST ?? 'localhost',
  port: databaseUrl ? undefined : Number(process.env.DATABASE_PORT ?? 5432),
  username: databaseUrl ? undefined : process.env.DATABASE_USER ?? process.env.PGUSER ?? process.env.POSTGRES_USER ?? 'postgres',
  password: databaseUrl ? undefined : process.env.DATABASE_PASSWORD ?? process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: databaseUrl ? undefined : process.env.DATABASE_NAME ?? process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE ?? 'tiquetera',
  ssl:
    databaseUrl?.includes('sslmode=require') || process.env.PGHOST?.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
  synchronize: true,
  entities: [User, Event, EventSector, Reservation, Purchase, StockMovement, Stadium]
});

async function upsertUser(name: string, email: string, plainPassword: string, role: UserRole) {
  const repo = dataSource.getRepository(User);
  const existing = await repo.findOne({ where: { email } });
  const password = await bcrypt.hash(plainPassword, Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
  await repo.save(repo.create({ ...existing, name, email, password, role }));
}

export async function seed() {
  await dataSource.initialize();

  await upsertUser('Admin', 'admin@tickets.com', 'Admin123*', UserRole.ADMIN);
  await upsertUser('Usuario', 'user@tickets.com', 'User123*', UserRole.USER);

  const stadiumRepo = dataSource.getRepository(Stadium);
  if (!(await stadiumRepo.exist())) {
    await stadiumRepo.save(
      stadiumRepo.create({
        name: 'Movistar Arena Demo',
        totalCapacity: 6000,
        sectorCapacities
      })
    );
  }

  const eventRepo = dataSource.getRepository(Event);
  if (!(await eventRepo.exist({ where: { title: 'Coldplay 2027' } }))) {
    await eventRepo.save(
      eventRepo.create({
        title: 'Coldplay 2027',
        description: 'Recital demo con venta por capacidad de sector.',
        imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
        date: new Date('2027-10-20T23:00:00.000Z'),
        sectors: [
          { sector: Sector.VIP, price: '80000.00', capacity: 1000, availableQuantity: 1000 },
          { sector: Sector.CAMPO, price: '50000.00', capacity: 2000, availableQuantity: 2000 },
          { sector: Sector.PLATEA_A, price: '65000.00', capacity: 1500, availableQuantity: 1500 },
          { sector: Sector.PLATEA_B, price: '45000.00', capacity: 1500, availableQuantity: 1500 }
        ]
      })
    );
  }

  await dataSource.destroy();
}
if (require.main === module) {
  seed().catch(async (error) => {
    console.error(error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  });
}
