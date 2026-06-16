import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@tickets.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'User123*' })
  @IsString()
  password: string;
}
