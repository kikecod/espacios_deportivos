import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";


export class CreateCalificaCanchaDto {
    @ApiProperty({ 
        description: 'ID de la reserva que se está reseñando',
        example: 123 
    })
    @IsInt()
    @Min(1)
    idReserva: number;

    @ApiProperty({ 
        description: 'Calificación de 1 a 5 estrellas',
        minimum: 1,
        maximum: 5,
        example: 5 
    })
    @IsInt()
    @Min(1, { message: 'El puntaje debe ser al menos 1' })
    @Max(5, { message: 'El puntaje debe ser como máximo 5' })
    puntaje: number;

    @ApiProperty({ 
        description: 'Comentario sobre la experiencia (opcional, máx 500 caracteres)',
        required: false,
        example: 'Excelente cancha, muy limpia y bien mantenida' 
    })
    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
    comentario?: string;
}
