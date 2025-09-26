import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsPositive, IsDateString } from 'class-validator';

export class CreateReservaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  idCliente: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  idCancha: number;

  @ApiProperty({ example: '2025-09-27T10:00:00.000Z' })
  @IsDateString()
  iniciaEn: Date;

  @ApiProperty({ example: '2025-09-27T12:00:00.000Z' })
  @IsDateString()
  terminaEn: Date;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  cantidadPersonas: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  requiereAprobacion: boolean;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  montoBase: number;

  @ApiProperty({ example: 20.0 })
  @IsNumber()
  montoExtra: number;

  @ApiProperty({ example: 120.0 })
  @IsNumber()
  montoTotal: number;
}