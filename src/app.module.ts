import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { dataSourceOptions } from './database/data-source.options';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.example'] }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => dataSourceOptions(config)
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    EventsModule,
    ReservationsModule,
    PurchasesModule,
    RealtimeModule,
    AdminModule
  ]
})
export class AppModule {}
