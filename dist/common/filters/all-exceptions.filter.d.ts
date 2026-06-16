import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { AppLogger } from '../logger/app.logger';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: AppLogger);
    catch(exception: unknown, host: ArgumentsHost): void;
}
