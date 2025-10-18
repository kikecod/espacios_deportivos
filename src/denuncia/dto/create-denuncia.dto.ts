import { IsInt, IsString, IsNotEmpty, Length, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDenunciaDto {

    @ApiProperty({ description: 'ID del Cliente que realiza la denuncia' })
    @IsInt()
    id_cliente: number;

    @ApiProperty({ description: 'ID de la Cancha denunciada' })
    @IsInt()
    id_cancha: number;

    @ApiProperty({ description: 'ID de la Sede donde ocurrió la denuncia' })
    @IsInt()
    id_sede: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    categoria: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsIn(['baja', 'media', 'alta']) // Ejemplo de validación para Gravedad
    gravedad: string;

    // 'estado' se omite ya que tiene un valor por defecto ('pendiente')

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Length(1, 150)
    titulo: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

}