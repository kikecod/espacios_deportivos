import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTransaccioneDto {
  @ApiProperty({
    description: 'Identificador de la transaccion generado por Libelula',
    example: 'LIB-20250101-ABC123',
  })
  @IsString()
  @IsNotEmpty()
  id_transaccion_libelula: string;

  @ApiProperty({
    description: 'URL a la que debe redirigirse al cliente para completar el pago',
    example: 'https://pagos.libelula.bo/pay/secure-token',
  })
  @IsString()
  @IsNotEmpty()
  url_pasarela_pagos: string;

  @ApiProperty({
    description: 'URL del QR estatico proporcionado por Libelula',
    example: 'https://pagos.libelula.bo/qr/secure-token',
    required: false,
  })
  @IsOptional()
  @IsString()
  qr_simple_url?: string;

  @ApiProperty({
    description: 'Estado del pago devuelto por la pasarela',
    example: 'PENDIENTE',
  })
  @IsString()
  @IsNotEmpty()
  estado_pago: string;

  @ApiProperty({
    description: 'Fecha en la que se liquido el pago (si aplica)',
    example: '2025-01-01T12:34:56.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_pago?: Date;

  @ApiProperty({
    description: 'Monto total de la transaccion',
    example: 150.5,
  })
  @IsNumber()
  @IsPositive()
  monto_total: number;

  @ApiProperty({
    description: 'Identificador del cliente asociado a la transaccion',
    example: 42,
  })
  @IsNumber()
  @IsPositive()
  cliente_id: number;

  @ApiProperty({
    description: 'Identificador de la reserva asociada',
    example: 77,
  })
  @IsNumber()
  @IsPositive()
  reserva_id: number;
}
