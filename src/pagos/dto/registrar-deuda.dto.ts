import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class RegistrarDeudaDto {
  @ApiProperty({
    description: 'Identificador de la reserva sobre la que se registrara la deuda',
    example: 128,
  })
  @IsInt()
  @IsPositive()
  reserva_id: number;

  @ApiProperty({
    description:
      'Descripcion breve que se enviara a la pasarela. Si no se envia se genera automaticamente.',
    example: 'Reserva cancha sintetica - Turno 20:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  descripcion?: string;
}
