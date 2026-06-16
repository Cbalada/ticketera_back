import { ConflictException } from '@nestjs/common';

export class PurchaseAlreadyCompletedException extends ConflictException {
  constructor() {
    super('Purchase already completed');
  }
}
