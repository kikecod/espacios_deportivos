import { Transform } from "class-transformer";
import { IsEmail, IsString,  MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail()
    correo: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    contrasena: string; // Se convertirá a hashContrasena en el service
}