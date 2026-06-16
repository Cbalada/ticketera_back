import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Sector } from '../../../common/enums/sector.enum';

export class SectorPriceDto {
  @ApiProperty({ enum: Sector })
  @IsEnum(Sector)
  sector: Sector;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdatePricesDto {
  @ApiProperty({ type: [SectorPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectorPriceDto)
  prices: SectorPriceDto[];
}
