"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const typeorm_1 = require("typeorm");
const sector_enum_1 = require("../common/enums/sector.enum");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const event_sector_entity_1 = require("../modules/events/entities/event-sector.entity");
const event_entity_1 = require("../modules/events/entities/event.entity");
const purchase_entity_1 = require("../modules/purchases/entities/purchase.entity");
const reservation_entity_1 = require("../modules/reservations/entities/reservation.entity");
const stadium_entity_1 = require("../modules/stadium/entities/stadium.entity");
const stock_movement_entity_1 = require("../modules/stock/entities/stock-movement.entity");
const user_entity_1 = require("../modules/users/entities/user.entity");
const sectorCapacities = {
    [sector_enum_1.Sector.VIP]: 1000,
    [sector_enum_1.Sector.CAMPO]: 2000,
    [sector_enum_1.Sector.PLATEA_A]: 1500,
    [sector_enum_1.Sector.PLATEA_B]: 1500
};
dotenv.config();
dotenv.config({ path: '.env.example' });
const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: databaseUrl,
    host: databaseUrl ? undefined : process.env.DATABASE_HOST ?? process.env.PGHOST ?? process.env.POSTGRES_HOST ?? 'localhost',
    port: databaseUrl ? undefined : Number(process.env.DATABASE_PORT ?? 5432),
    username: databaseUrl ? undefined : process.env.DATABASE_USER ?? process.env.PGUSER ?? process.env.POSTGRES_USER ?? 'postgres',
    password: databaseUrl ? undefined : process.env.DATABASE_PASSWORD ?? process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: databaseUrl ? undefined : process.env.DATABASE_NAME ?? process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE ?? 'tiquetera',
    ssl: databaseUrl?.includes('sslmode=require') || process.env.PGHOST?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    synchronize: true,
    entities: [user_entity_1.User, event_entity_1.Event, event_sector_entity_1.EventSector, reservation_entity_1.Reservation, purchase_entity_1.Purchase, stock_movement_entity_1.StockMovement, stadium_entity_1.Stadium]
});
async function upsertUser(name, email, plainPassword, role) {
    const repo = dataSource.getRepository(user_entity_1.User);
    const existing = await repo.findOne({ where: { email } });
    const password = await bcrypt.hash(plainPassword, Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
    await repo.save(repo.create({ ...existing, name, email, password, role }));
}
async function seed() {
    await dataSource.initialize();
    await upsertUser('Admin', 'admin@tickets.com', 'Admin123*', user_role_enum_1.UserRole.ADMIN);
    await upsertUser('Usuario', 'user@tickets.com', 'User123*', user_role_enum_1.UserRole.USER);
    const stadiumRepo = dataSource.getRepository(stadium_entity_1.Stadium);
    if (!(await stadiumRepo.exist())) {
        await stadiumRepo.save(stadiumRepo.create({
            name: 'Movistar Arena Demo',
            totalCapacity: 6000,
            sectorCapacities
        }));
    }
    const eventRepo = dataSource.getRepository(event_entity_1.Event);
    if (!(await eventRepo.exist({ where: { title: 'Coldplay 2027' } }))) {
        await eventRepo.save(eventRepo.create({
            title: 'Coldplay 2027',
            description: 'Recital demo con venta por capacidad de sector.',
            imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
            date: new Date('2027-10-20T23:00:00.000Z'),
            sectors: [
                { sector: sector_enum_1.Sector.VIP, price: '80000.00', capacity: 1000, availableQuantity: 1000 },
                { sector: sector_enum_1.Sector.CAMPO, price: '50000.00', capacity: 2000, availableQuantity: 2000 },
                { sector: sector_enum_1.Sector.PLATEA_A, price: '65000.00', capacity: 1500, availableQuantity: 1500 },
                { sector: sector_enum_1.Sector.PLATEA_B, price: '45000.00', capacity: 1500, availableQuantity: 1500 }
            ]
        }));
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
//# sourceMappingURL=seed.js.map