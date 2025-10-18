import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsPositive, IsString, MinLength } from "class-validator";


export class CreateCanchaDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    id_sede: number;
    
    @ApiProperty({ example: "Cancha principal" })
    @IsString()
    @MinLength(5)
    nombre: string;

    @ApiProperty({ example: "Césped sintético" })
    @IsString()
    @MinLength(5)
    superficie: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    cubierta: boolean;

    @ApiProperty({ example: 100 })
    @IsInt()
    @IsPositive()
    aforoMax: number;

    @ApiProperty({ example: "40x20 metros" })
    @IsString()
    @MinLength(5)
    dimensiones: string;

    @ApiProperty({ example: "No se permite comida" })
    @IsString()
    @MinLength(5)
    reglas_uso: string;

    @ApiProperty({ example: "LED" })
    @IsString()
    @MinLength(3)
    iluminacion: string;

    @ApiProperty({ example: "Disponible" })
    @IsString()
    @MinLength(5)
    estado: string;

    @ApiProperty({ example: 150.00 })
    @IsNumber()
    precio: number;
}
