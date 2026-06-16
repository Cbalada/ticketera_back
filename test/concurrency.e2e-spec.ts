import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Sector } from '../src/common/enums/sector.enum';
import { UserRole } from '../src/common/enums/user-role.enum';
import { EventSector } from '../src/modules/events/entities/event-sector.entity';
import { Event } from '../src/modules/events/entities/event.entity';
import { Purchase } from '../src/modules/purchases/entities/purchase.entity';
import { Reservation } from '../src/modules/reservations/entities/reservation.entity';
import { User } from '../src/modules/users/entities/user.entity';
import { describe } from 'node:test';

jest.setTimeout(60000);

describe('Reservation concurrency (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let sectorId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.getRepository(Purchase).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Reservation).createQueryBuilder().delete().execute();
    await dataSource.getRepository(EventSector).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Event).createQueryBuilder().delete().execute();
    await dataSource.getRepository(User).createQueryBuilder().delete().execute();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each([10, 20, 50])('handles %i simultaneous reservation attempts without overselling', async (users) => {
    const tokens = await Promise.all(Array.from({ length: users }, (_, index) => createAndLoginUser(index)));
    const event = await dataSource.getRepository(Event).save({
      title: `Load Test ${users}`,
      description: 'Concurrency fixture',
      imageUrl: 'https://example.com/event.jpg',
      date: new Date('2027-01-01T00:00:00.000Z'),
      sectors: [
        {
          sector: Sector.VIP,
          price: '100.00',
          capacity: 10,
          availableQuantity: 10
        }
      ]
    });
    sectorId = event.sectors[0].id;

    const responses = await Promise.all(
      tokens.map((token) =>
        request(app.getHttpServer())
          .post('/reservations')
          .set('Authorization', `Bearer ${token}`)
          .send({ eventSectorId: sectorId, quantity: 1 })
      )
    );

    const successful = responses.filter((response) => response.status === 201).length;
    const sector = await dataSource.getRepository(EventSector).findOneByOrFail({ id: sectorId });
    expect(successful).toBe(10);
    expect(sector.availableQuantity).toBe(0);
    expect(sector.availableQuantity).toBeGreaterThanOrEqual(0);
  });

  async function createAndLoginUser(index: number) {
    const email = `concurrent-${index}@tickets.com`;
    await dataSource.getRepository(User).save({
      name: `Concurrent User ${index}`,
      email,
      password: await bcrypt.hash('User123*', 4),
      role: UserRole.USER
    });
    const login = await request(app.getHttpServer()).post('/auth/login').send({ email, password: 'User123*' });
    return login.body.accessToken;
  }
});



