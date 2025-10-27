import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateBloqueoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  id_cancha: number;

  @ApiProperty({ example: '2025-10-27T10:00:00.000Z' })
  @IsDateString()
  inicia_en: Date;

  @ApiProperty({ example: '2025-10-27T12:00:00.000Z' })
  @IsDateString()
  termina_en: Date;

  @ApiProperty({ example: 'Mantenimiento', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;
}
