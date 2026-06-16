import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ada@tickets.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Strong123*' })
  @IsString()
  @MinLength(8)
  password: string;
}
