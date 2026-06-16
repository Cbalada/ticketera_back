import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsString, ValidateNested } from 'class-validator';
import { CreateEventSectorDto } from './create-event-sector.dto';

export class CreateEventDto {
  @ApiProperty({ example: 'Coldplay 2027' })
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: '2027-10-20T23:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ type: [CreateEventSectorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventSectorDto)
  sectors: CreateEventSectorDto[];
}
