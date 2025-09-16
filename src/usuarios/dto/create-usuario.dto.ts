import { IsEmail, IsString, IsBoolean, IsEnum, IsOptional, IsNumber, MinLength } from 'class-validator';
import { EstadoUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsNumber()
  idPersona: number;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  contrasena: string; // Se convertirá a hashContrasena en el service

  @IsOptional()
  @IsBoolean()
  correoVerificado?: boolean;

  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;
}