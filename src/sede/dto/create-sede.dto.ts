import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsLatitude, IsLongitude, IsNumber, IsPositive, IsString, Length, MinLength } from "class-validator";


export class CreateSedeDto {

    @ApiProperty()
    @IsInt()
    @IsPositive()
    idPersonaD: number;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    nombre: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    descripcion: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    direccion: string;

    @ApiProperty()
    @IsLatitude()
    latitud: number;

    @ApiProperty()
    @IsLongitude()
    longitud: number;

    @ApiProperty()
    @IsString()
    @Length(7, 20)
    telefono: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    politicas: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    estado: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    NIT: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    LicenciaFuncionamiento: string;
}
