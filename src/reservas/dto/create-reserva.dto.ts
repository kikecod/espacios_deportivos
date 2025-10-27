import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsPositive,
  IsDateString,
  IsOptional,
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
  inicia_en: string;

  @ApiProperty({ example: '2025-09-27T12:00:00.000Z' })
  @IsDateString()
  termina_en: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  cantidad_personas: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  requiere_aprobacion: boolean;

  @ApiProperty({ example: 100.0, required: false, description: 'Calculado por el servidor segun precio por hora' })
  @IsOptional()
  @IsNumber()
  monto_base?: number;

  @ApiProperty({ example: 0.0, required: false, description: 'Calculado por el servidor' })
  @IsOptional()
  @IsNumber()
  monto_extra?: number;

  @ApiProperty({ example: 120.0, required: false, description: 'Calculado por el servidor' })
  @IsOptional()
  @IsNumber()
  monto_total?: number;
}
