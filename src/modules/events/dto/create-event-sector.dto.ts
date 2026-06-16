import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { Sector } from '../../../common/enums/sector.enum';

export class CreateEventSectorDto {
  @ApiProperty({ enum: Sector })
  @IsEnum(Sector)
  sector: Sector;

  @ApiProperty({ example: 30000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(1)
  capacity: number;
}
