import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreatePurchaseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  reservationId: number;
}
