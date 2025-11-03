import { IsOptional, IsInt, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardFiltersDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  idDuenio?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  idCancha?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  idSede?: number;
}

export class CanchaStatsDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'El mes debe estar en formato YYYY-MM (ej: 2025-10)',
  })
  mes?: string;
}
