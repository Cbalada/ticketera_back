import { UnauthorizedException as NestUnauthorizedException } from '@nestjs/common';
export declare class UnauthorizedException extends NestUnauthorizedException {
    constructor(message?: string);
}
