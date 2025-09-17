import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, MinLength } from "class-validator";

export class RegisterDto {

    @IsNumber()
    idPersona: number;

    @IsEmail()
    correo: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    contrasena: string; // Se convertirá a hashContrasena en el service

    @IsOptional()
    @IsBoolean()
    correoVerificado?: boolean;
}