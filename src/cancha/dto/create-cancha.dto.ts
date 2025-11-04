import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsPositive, IsString, Matches, MinLength } from "class-validator";


export class CreateCanchaDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idSede: number;
    
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
    reglasUso: string;

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

    @ApiProperty({ 
        example: "06:00",
        description: "Hora de apertura en formato HH:mm o HH:mm:ss"
    })
    @IsString()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'horaApertura debe estar en formato HH:mm o HH:mm:ss (ej: 06:00 o 06:00:00)'
    })
    horaApertura: string;

    @ApiProperty({ 
        example: "23:00",
        description: "Hora de cierre en formato HH:mm o HH:mm:ss"
    })
    @IsString()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'horaCierre debe estar en formato HH:mm o HH:mm:ss (ej: 23:00 o 23:00:00)'
    })
    horaCierre: string;
}
