import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsPositive, IsString } from 'class-validator';

export class CreatePasesAccesoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  id_pase_acceso: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  id_reserva: number;

  @ApiProperty({ example: 'abc123xyz456' })
  @IsString()
  hash_code: string;

  @ApiProperty({ example: '2025-09-27T10:00:00.000Z' })
  @IsDateString()
  valido_desde: Date;

  @ApiProperty({ example: '2025-09-27T12:00:00.000Z' })
  @IsDateString()
  valido_hasta: Date;

  @ApiProperty({ example: 'activo' })
  @IsString()
  estado: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDateString()
  creado_en: Date;
}
