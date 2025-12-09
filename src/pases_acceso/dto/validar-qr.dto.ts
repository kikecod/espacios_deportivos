import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class ValidarQRDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Codigo QR unico generado para el pase de acceso',
  })
  @IsString()
  @IsNotEmpty()
  codigoQR: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID de la persona operativa (controlador). Si falta, se toma del token.',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  idControlador?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Alias idPersonaOpe (opcional, se toma del token si falta).',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  idPersonaOpe?: number;

  @ApiProperty({
    example: 'entrada',
    enum: ['entrada', 'salida'],
    description: 'Tipo de accion: entrada o salida',
  })
  @IsEnum(['entrada', 'salida'])
  accion: string;
}
