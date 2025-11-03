import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateCalificaCanchaDto {
    @ApiProperty({ 
        description: 'Nueva calificación (1-5)',
        required: false,
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    puntaje?: number;
    
    @ApiProperty({ 
        description: 'Nuevo comentario (máx 500 caracteres)',
        required: false 
    })
    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'El comentario no puede exceder 500 caracteres' })
    comentario?: string;
}
