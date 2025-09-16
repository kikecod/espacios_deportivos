import { IsInt, IsPositive, IsString, MinLength } from "class-validator";


export class CreateSedeDto {
    @IsInt()
    @IsPositive()
    idPersonaD: number;

    @IsString()
    @MinLength(5)
    nombre: string;

    @IsString()
    @MinLength(5)
    descripcion: string;

    @IsString()
    @MinLength(5)
    direccion: string;

    @IsString()
    @MinLength(5)
    latitud: string;

    @IsString()
    @MinLength(5)
    longitud: string;

    @IsString()
    @MinLength(5)
    telefono: string;

    @IsString()
    @MinLength(5)
    email: string;

    @IsString()
    @MinLength(5)
    politicas: string;

    @IsString()
    @MinLength(5)
    estado: string;

    @IsString()
    @MinLength(5)
    NIT: string;

    @IsString()
    @MinLength(5)
    LicenciaFuncionamiento: string;
}
