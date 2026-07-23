"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const seed_1 = require("./database/seed");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const app_logger_1 = require("./common/logger/app.logger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const logger = app.get(app_logger_1.AppLogger);
    app.useLogger(logger);
    app.use(cookieParser());
    app.enableCors({
        origin: ['https://ticketera-front-khaki.vercel.app'],
        credentials: true
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(logger));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Tiquetera API')
        .setDescription('Venta de entradas con reservas transaccionales y Socket.IO')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    const port = app.get(config_1.ConfigService).get('PORT', 3000);
    try {
        const runSeed = process.env.TYPEORM_SYNCHRONIZE === 'true' || process.env.RUN_SEED === 'true';
        if (runSeed) {
            await (0, seed_1.seed)();
        }
    }
    catch (err) {
        logger.error('Database seed failed', err);
    }
    await app.listen(port);
    logger.log(`API listening on ${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map