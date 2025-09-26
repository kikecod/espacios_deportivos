import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString,  MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty()
    @IsEmail()
    correo: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    contrasena: string; // Se convertirá a hashContrasena en el service
}