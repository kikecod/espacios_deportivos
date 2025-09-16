import { IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { TipoRol } from '../rol.entity';

export class CreateRolDto {
  @IsNumber()
  idUsuario: number;

  @IsEnum(TipoRol)
  rol: TipoRol;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}