import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {

    @ApiProperty()
    @IsNumber()
    idPersona: number;

    @ApiProperty({ maxLength: 50 })
    @IsString()
    @MaxLength(50)
    usuario: string;

    @ApiProperty()
    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'La contraseña debe tener una letra mayúscula, una letra minúscula y un número'
    })
    contrasena: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    correoVerificado?: boolean;
}