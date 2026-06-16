import { ConflictException } from '@nestjs/common';

export class InsufficientStockException extends ConflictException {
  constructor() {
    super('Insufficient stock');
  }
}
