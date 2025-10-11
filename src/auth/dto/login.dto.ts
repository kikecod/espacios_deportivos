// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  correo: string;

  @ApiProperty()
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  contrasena: string;
}
