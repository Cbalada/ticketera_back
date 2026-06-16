"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const dataSourceOptions = (config) => ({
    type: 'postgres',
    url: config.get('DATABASE_URL') ?? config.get('POSTGRES_URL'),
    host: config.get('DATABASE_URL') || config.get('POSTGRES_URL')
        ? undefined
        : config.get('DATABASE_HOST') ?? config.get('PGHOST') ?? config.get('POSTGRES_HOST') ?? 'localhost',
    port: config.get('DATABASE_URL') || config.get('POSTGRES_URL')
        ? undefined
        : config.get('DATABASE_PORT', 5432),
    username: config.get('DATABASE_URL') || config.get('POSTGRES_URL')
        ? undefined
        : config.get('DATABASE_USER') ?? config.get('PGUSER') ?? config.get('POSTGRES_USER') ?? 'postgres',
    password: config.get('DATABASE_URL') || config.get('POSTGRES_URL')
        ? undefined
        : config.get('DATABASE_PASSWORD') ?? config.get('PGPASSWORD') ?? config.get('POSTGRES_PASSWORD') ?? 'postgres',
    database: config.get('DATABASE_URL') || config.get('POSTGRES_URL')
        ? undefined
        : config.get('DATABASE_NAME') ?? config.get('PGDATABASE') ?? config.get('POSTGRES_DATABASE') ?? 'tiquetera',
    ssl: config.get('DATABASE_URL')?.includes('sslmode=require') ||
        config.get('POSTGRES_URL')?.includes('sslmode=require') ||
        config.get('PGHOST')?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    autoLoadEntities: true,
    synchronize: config.get('TYPEORM_SYNCHRONIZE')
        ? config.get('TYPEORM_SYNCHRONIZE') === 'true'
        : false
});
exports.dataSourceOptions = dataSourceOptions;
//# sourceMappingURL=data-source.options.js.map