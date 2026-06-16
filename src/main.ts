import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { seed } from './database/seed';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppLogger } from './common/logger/app.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const config = new DocumentBuilder()
    .setTitle('Tiquetera API')
    .setDescription('Venta de entradas con reservas transaccionales y Socket.IO')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = app.get(ConfigService).get<number>('PORT', 3000);
  try {
    // Run seed only when explicitly requested via env var to avoid
    // initializing a separate DataSource with `synchronize: true` on every
    // app startup (it can run concurrent internal queries and trigger pg
    // deprecation warnings).
    const runSeed = process.env.TYPEORM_SYNCHRONIZE === 'true' || process.env.RUN_SEED === 'true';
    if (runSeed) {
      await seed();
    }
  } catch (err) {
    logger.error('Database seed failed', err as any);
  }
  await app.listen(port);
  logger.log(`API listening on ${port}`);
}

void bootstrap();
