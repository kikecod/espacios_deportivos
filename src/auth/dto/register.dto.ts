// src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean, IsEmail, IsOptional, IsString,
  Matches, MaxLength, MinLength, ValidateNested,
} from 'class-validator';
import { CreatePersonaDto } from 'src/personas/dto/create-persona.dto';

export class RegisterDto {
  @ApiProperty({ maxLength: 50, example: 'nickname' })
  @IsString()
  @MaxLength(50)
  usuario: string;

  @ApiProperty({ example: 'usuario@gmail.com' })
  @IsEmail()
  correo: string;

  @ApiProperty({
    description: 'Mínimo 6, con mayúscula, minúscula y número',
    example: 'Admin123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una letra mayúscula, una letra minúscula y un número',
  })
  contrasena: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  correoVerificado?: boolean;

  @ApiProperty({ type: () => CreatePersonaDto })
  @ValidateNested()
  @Type(() => CreatePersonaDto)
  persona: CreatePersonaDto; // <-- sin idPersona
}
