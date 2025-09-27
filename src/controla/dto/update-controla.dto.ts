import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateControlaDto } from './create-controla.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateControlaDto {
    
    // No incluimos idPersonaOpe, idReserva, o idPaseAcceso, ya que no se actualizan
    // y se pasan en la URL del controlador.

    @ApiPropertyOptional()
    @IsString()
    accion: string;

    @ApiPropertyOptional()
    @IsString()
    resultado: string;
}

