import { BadRequestException } from '@nestjs/common';

export class ReservationExpiredException extends BadRequestException {
  constructor() {
    super('Reservation expired');
  }
}
