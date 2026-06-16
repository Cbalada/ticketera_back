import { ConflictException } from '@nestjs/common';
export declare class PurchaseAlreadyCompletedException extends ConflictException {
    constructor();
}
