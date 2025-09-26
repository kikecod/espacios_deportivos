import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, MinLength } from "class-validator";

export class RegisterDto {

    @ApiProperty()
    @IsNumber()
    idPersona: number;

    @ApiProperty()
    @IsEmail()
    correo: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    contrasena: string; // Se convertirá a hashContrasena en el service

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    correoVerificado?: boolean;
}