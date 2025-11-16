import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoRol } from '../../roles/rol.entity';

export class FiltrosUsuariosDto {
  @IsOptional()
  @IsEnum(TipoRol)
  rol?: TipoRol;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
