import { IsString, IsEmail, IsOptional, IsArray, IsEnum, ValidateNested, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoRol } from '../../roles/rol.entity';

class PersonaUpdateDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellidoPaterno?: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  ci?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

class ClienteUpdateDto {
  @IsOptional()
  @IsString()
  apodo?: string;

  @IsOptional()
  @IsNumber()
  nivel?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

class DuenioUpdateDto {
  @IsOptional()
  @IsBoolean()
  verificado?: boolean;

  @IsOptional()
  @IsString()
  imagenCI?: string;

  @IsOptional()
  @IsString()
  imagenFacial?: string;
}

class ControladorUpdateDto {
  @IsOptional()
  @IsString()
  codigoEmpleado?: string;

  @IsOptional()
  @IsString()
  turno?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ActualizarUsuarioAdminDto {
  @IsOptional()
  @IsString()
  usuario?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(TipoRol, { each: true })
  roles?: TipoRol[];

  @IsOptional()
  @IsString()
  avatarPath?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PersonaUpdateDto)
  persona?: PersonaUpdateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClienteUpdateDto)
  cliente?: ClienteUpdateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DuenioUpdateDto)
  duenio?: DuenioUpdateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ControladorUpdateDto)
  controlador?: ControladorUpdateDto;
}
