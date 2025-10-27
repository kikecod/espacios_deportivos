import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RegistrarDeudaDto {
  @ApiProperty({ example: 77 })
  @IsInt()
  @IsPositive()
  reserva_id: number;

  @ApiProperty({ example: 42 })
  @IsInt()
  @IsPositive()
  cliente_id: number;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @IsPositive()
  monto_total: number;

  @ApiProperty({ example: 'Reserva Cancha Central - 2025-11-01 10:00', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
