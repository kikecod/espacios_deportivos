import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const resolveNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

export class CreateCanchaDto {
  @ApiProperty({ example: 1 })
  @Transform(({ value, obj }) => resolveNumber(value ?? obj.idSede ?? obj.sedeId))
  @IsInt()
  @IsPositive()
  id_sede: number;

  @ApiProperty({ example: 'Cancha principal' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  nombre: string;

  @ApiProperty({ example: 'Césped sintético' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  superficie: string;

  @ApiProperty({ example: true })
  @Transform(({ value, obj }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
    }
    if (typeof obj?.cubierta === 'boolean') {
      return obj.cubierta;
    }
    return Boolean(value);
  })
  @IsBoolean()
  cubierta: boolean;

  @ApiProperty({ example: 100 })
  @Transform(({ value, obj }) => resolveNumber(value ?? obj.aforo_max))
  @IsInt()
  @IsPositive()
  aforoMax: number;

  @ApiProperty({ example: '40x20 metros' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  dimensiones: string;

  @ApiProperty({ example: 'No se permite comida' })
  @Transform(({ value, obj }) => {
    const raw =
      value ??
      obj.reglas_uso ??
      obj.reglasuso ??
      obj.reglas ??
      '';
    return typeof raw === 'string' ? raw.trim() : raw;
  })
  @IsString()
  @MinLength(3)
  reglasUso: string;

  @ApiProperty({ example: 'LED' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  iluminacion: string;

  @ApiProperty({ example: 'Disponible' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  estado: string;

  @ApiProperty({
    example: 150.0,
    description: 'Precio por hora en moneda boliviana (BOB)',
  })
  @Type(() => Number)
  @IsNumber()
  precio: number;
}
