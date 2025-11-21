import { IsString, IsEmail, IsOptional, IsArray, IsEnum, ValidateNested, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoRol } from '../../roles/rol.entity';

class PersonaCreateDto {
  @IsString()
  nombre: string;

  @IsString()
  apellidoPaterno: string;

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

class ClienteCreateDto {
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

class DuenioCreateDto {
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

class ControladorCreateDto {
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

export class CrearUsuarioAdminDto {
  @IsString()
  usuario: string;

  @IsEmail()
  correo: string;

  @IsOptional()
  @IsString()
  contrasena?: string;

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

  @ValidateNested()
  @Type(() => PersonaCreateDto)
  persona: PersonaCreateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClienteCreateDto)
  cliente?: ClienteCreateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DuenioCreateDto)
  duenio?: DuenioCreateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ControladorCreateDto)
  controlador?: ControladorCreateDto;
}
