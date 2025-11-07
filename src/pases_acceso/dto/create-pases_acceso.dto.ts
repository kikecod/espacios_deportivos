import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class CreatePasesAccesoDto {
    
    @ApiProperty({ 
        example: 1,
        description: 'ID de la reserva para la cual se genera el pase'
    })
    @IsInt()
    @IsPositive()
    idReserva: number;

    // Todos los demás campos se generan automáticamente:
    // - codigoQR (UUID v4)
    // - hashCode (SHA-256)
    // - validoDesde (30 min antes de la reserva)
    // - validoHasta (30 min después de la reserva)
    // - estado (pendiente)
    // - usoMaximo (cantidadPersonas de la reserva)
}
