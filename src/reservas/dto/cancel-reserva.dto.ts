import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelReservaDto {
  @ApiProperty({ 
    required: false,
    description: 'Motivo de la cancelación',
    example: 'No podré asistir por motivos personales'
  })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiProperty({ 
    required: false,
    maxLength: 50,
    description: 'Canal por el cual se realiza la cancelación',
    example: 'WEB',
    default: 'API'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  canal?: string;
}
