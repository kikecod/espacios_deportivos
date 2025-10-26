import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateControlaDto } from './create-controla.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateControlaDto {
  // No incluimos id_persona_ope, id_reserva, o id_pase_acceso, ya que no se actualizan
  // y se pasan en la URL del controlador.

  @ApiPropertyOptional()
  @IsString()
  accion: string;

  @ApiPropertyOptional()
  @IsString()
  resultado: string;
}
