import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, Matches } from 'class-validator';

export class CheckAvailabilityDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la cancha',
  })
  @IsInt()
  idCancha: number;

  @ApiProperty({
    example: '2025-11-08',
    description: 'Fecha de la reserva (YYYY-MM-DD)',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({
    example: '14:00',
    description: 'Hora de inicio (HH:mm)',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe estar en formato HH:mm',
  })
  horaInicio: string;

  @ApiProperty({
    example: '16:00',
    description: 'Hora de fin (HH:mm)',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaFin debe estar en formato HH:mm',
  })
  horaFin: string;
}
