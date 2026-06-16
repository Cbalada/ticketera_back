import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

export const dataSourceOptions = (config: ConfigService): TypeOrmModuleOptions & DataSourceOptions => ({
  type: 'postgres',
  url: config.get<string>('DATABASE_URL') ?? config.get<string>('POSTGRES_URL'),
  host: config.get<string>('DATABASE_URL') || config.get<string>('POSTGRES_URL')
    ? undefined
    : config.get<string>('DATABASE_HOST') ?? config.get<string>('PGHOST') ?? config.get<string>('POSTGRES_HOST') ?? 'localhost',
  port: config.get<string>('DATABASE_URL') || config.get<string>('POSTGRES_URL')
    ? undefined
    : config.get<number>('DATABASE_PORT', 5432),
  username: config.get<string>('DATABASE_URL') || config.get<string>('POSTGRES_URL')
    ? undefined
    : config.get<string>('DATABASE_USER') ?? config.get<string>('PGUSER') ?? config.get<string>('POSTGRES_USER') ?? 'postgres',
  password: config.get<string>('DATABASE_URL') || config.get<string>('POSTGRES_URL')
    ? undefined
    : config.get<string>('DATABASE_PASSWORD') ?? config.get<string>('PGPASSWORD') ?? config.get<string>('POSTGRES_PASSWORD') ?? 'postgres',
  database: config.get<string>('DATABASE_URL') || config.get<string>('POSTGRES_URL')
    ? undefined
    : config.get<string>('DATABASE_NAME') ?? config.get<string>('PGDATABASE') ?? config.get<string>('POSTGRES_DATABASE') ?? 'tiquetera',
  ssl:
    config.get<string>('DATABASE_URL')?.includes('sslmode=require') ||
    config.get<string>('POSTGRES_URL')?.includes('sslmode=require') ||
    config.get<string>('PGHOST')?.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
  autoLoadEntities: true,
  // Disable automatic schema sync by default to avoid TypeORM running
  // concurrent queries on the same QueryRunner which trigger pg deprecation
  // warnings. Enable with TYPEORM_SYNCHRONIZE=true if you need it.
  synchronize: config.get<string>('TYPEORM_SYNCHRONIZE')
    ? config.get<string>('TYPEORM_SYNCHRONIZE') === 'true'
    : false
});
