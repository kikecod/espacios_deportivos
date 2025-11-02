import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNotEmpty, IsString, Max, Min, IsIn, IsOptional } from "class-validator";


export class CreateCalificaCanchaDto {
    @ApiProperty({ description: 'ID del Cliente que califica' })
    @IsInt()
    @Min(1)
    idCliente: number;

    @ApiProperty({ description: 'ID de la Cancha que es calificada' })
    @IsInt()
    @Min(1)
    idCancha: number;

    @ApiProperty({ description: 'ID de la Sede a la que pertenece la Cancha' })
    @IsInt()
    @Min(1)
    idSede: number;

    @ApiProperty({ description: 'Puntuación de la calificación (entre 1 y 5)' })
    @IsInt()
    @Min(1, { message: 'El puntaje debe ser al menos 1' })
    @Max(5, { message: 'El puntaje debe ser como máximo 5' })
    puntaje: number;

    @ApiProperty({ description: 'Comentario sobre las dimensiones de la cancha' })
    @IsString()
    @IsNotEmpty()
    dimensiones: string;

    @ApiProperty({ description: 'Comentario general de la calificación' })
    @IsString()
    @IsNotEmpty()
    comentario: string;

    @ApiProperty({ description: "Estado de la calificación", required: false, enum: ['ACTIVA','OCULTA','ELIMINADA'], default: 'ACTIVA' })
    @IsOptional()
    @IsIn(['ACTIVA','OCULTA','ELIMINADA'])
    estado?: 'ACTIVA' | 'OCULTA' | 'ELIMINADA';

}
