import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, MinLength } from "class-validator";

export class RegisterDto {

    @ApiProperty()
    @IsNumber()
    id_persona: number;

    @ApiProperty({ maxLength: 50 })
    @IsString()
    @MaxLength(50)
    usuario: string;

    @ApiProperty()
    @IsEmail()
    correo: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @MinLength(8)
    @MaxLength(20)
    contrasena: string; // Se convertirá a hash_contrasena en el service

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    correo_verificado?: boolean;
}