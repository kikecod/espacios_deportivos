import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreatePasesAccesoDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @IsPositive()
  id_reserva: number;

  @ApiProperty({
    example: 'ROGU-12345678',
    description: 'Contenido codificado del QR asociado a la reserva',
  })
  @IsString()
  qr: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @IsPositive()
  cantidad_personas: number;
}
