import { IsIn, IsInt, IsOptional, IsString, Min, IsArray } from 'class-validator';

export class QueryFavoritosDto {
  @IsOptional()
  @IsIn(['reciente','rating','precio-asc','precio-desc'])
  orden?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  precioMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  precioMax?: number;

  // Nuevo: filtro por disciplinas (ids). Puede venir como disciplinas=1&disciplinas=4
  @IsOptional()
  @IsArray()
  disciplinas?: number[] | string[];

  @IsOptional()
  @IsIn(['any','all'])
  match?: 'any' | 'all';

  // Compat: filtro por texto de superficie (depreciado, usar disciplinas)
  @IsOptional()
  @IsString()
  superficie?: string;
}
