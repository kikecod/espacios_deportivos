import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateDuenioDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsPositive()
    id_personaD: number;

    @ApiProperty({ example: true })
    @IsOptional()
    @IsBoolean()
    verificado: boolean;

    @ApiProperty({ example: "foto" })
    @IsString()
    imagen_ci: string;

    @ApiProperty({ example: "foto" })
    @IsString()
    imagen_facial: string;
}
