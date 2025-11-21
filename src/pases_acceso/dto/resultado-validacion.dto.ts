import { ApiProperty } from "@nestjs/swagger";

class InfoPaseDto {
    @ApiProperty({ example: 123 })
    id: number;

    @ApiProperty({ example: 1 })
    vecesUsado: number;

    @ApiProperty({ example: 10 })
    usosRestantes: number;

    @ApiProperty({ example: '2025-11-06T18:30:00Z' })
    ultimoUso: Date;
}

class InfoReservaDto {
    @ApiProperty({ example: 456 })
    id: number;

    @ApiProperty({ example: 'Juan Pérez' })
    cliente: string;

    @ApiProperty({ example: 'Fútbol 5 - Sede Norte' })
    cancha: string;

    @ApiProperty({ example: '18:00 - 19:00' })
    horario: string;

    @ApiProperty({ example: 10 })
    cantidadPersonas: number;
}

export class ResultadoValidacionDto {
    
    @ApiProperty({ 
        example: true,
        description: 'Indica si el acceso fue concedido o denegado'
    })
    valido: boolean;

    @ApiProperty({ 
        example: 'ACCESO_PERMITIDO',
        description: 'Código del resultado de la validación',
        enum: [
            'ACCESO_PERMITIDO',
            'QR_NO_EXISTE',
            'PASE_CANCELADO',
            'PASE_EXPIRADO',
            'DEMASIADO_TEMPRANO',
            'PASE_VENCIDO',
            'YA_UTILIZADO',
            'RESERVA_NO_CONFIRMADA'
        ]
    })
    motivo: string;

    @ApiProperty({ 
        example: '✅ Acceso concedido',
        description: 'Mensaje descriptivo del resultado'
    })
    mensaje: string;

    @ApiProperty({ 
        required: false,
        type: InfoPaseDto,
        description: 'Información del pase (solo si es válido)'
    })
    pase?: InfoPaseDto;

    @ApiProperty({ 
        required: false,
        type: InfoReservaDto,
        description: 'Información de la reserva (solo si es válido)'
    })
    reserva?: InfoReservaDto;

    @ApiProperty({ 
        required: false,
        example: '2025-11-06T17:30:00Z',
        description: 'Fecha desde cuando será válido (solo para errores de tiempo)'
    })
    validoDesde?: Date;
}
