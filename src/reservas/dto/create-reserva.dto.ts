import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsPositive,
  IsDateString,
} from 'class-validator';

export class CreateReservaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  id_cliente: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  id_cancha: number;

  @ApiProperty({ example: '2025-09-27T10:00:00.000Z' })
  @IsDateString()
  inicia_en: Date;

  @ApiProperty({ example: '2025-09-27T12:00:00.000Z' })
  @IsDateString()
  termina_en: Date;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  cantidad_personas: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  requiere_aprobacion: boolean;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  monto_base: number;

  @ApiProperty({ example: 20.0 })
  @IsNumber()
  monto_extra: number;

  @ApiProperty({ example: 120.0 })
  @IsNumber()
  monto_total: number;
}
