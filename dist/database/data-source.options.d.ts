import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
export declare const dataSourceOptions: (config: ConfigService) => TypeOrmModuleOptions & DataSourceOptions;
