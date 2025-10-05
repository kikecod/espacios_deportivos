import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsBoolean, IsEnum, IsOptional, IsNumber, MinLength } from 'class-validator';
import { EstadoUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsNumber()
  idPersona: number;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  usuario: string;

  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  contrasena: string; // Se convertirá a hashContrasena en el service

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  correoVerificado?: boolean;

  @ApiProperty({ enum: EstadoUsuario, required: false })
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;
}