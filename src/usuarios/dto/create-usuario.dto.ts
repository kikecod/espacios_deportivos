import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsNumber,
  MinLength,
} from 'class-validator';
import { EstadoUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsNumber()
  id_persona: number;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  usuario: string;

  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  contrasena: string; // Se convertirá a hash_contrasena en el service

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  correo_verificado?: boolean;

  @ApiProperty({ enum: EstadoUsuario, required: false })
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;
}
