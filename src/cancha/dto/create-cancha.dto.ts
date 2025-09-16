import { IsBoolean, IsInt, IsNumber, IsPositive, IsString, MinLength } from "class-validator";


export class CreateCanchaDto {

    @IsInt()
    @IsPositive()
    idSede: number;
    
    @IsString()
    @MinLength(5)
    nombre: string;

    @IsString()
    @MinLength(5)
    superficie: string;

    @IsBoolean()
    cubierta: boolean;

    @IsInt()
    @IsPositive()
    aforoMax: number;

    @IsString()
    @MinLength(5)
    dimensiones: string;

    @IsString()
    @MinLength(5)
    reglasUso: string;

    @IsString()
    @MinLength(5)
    iluminacion: string;

    @IsString()
    @MinLength(5)
    estado: string;

    @IsNumber()
    @IsPositive()
    precio: number;
}
