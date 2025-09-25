import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateDuenioDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsPositive()
    idPersonaD: number;

    @ApiProperty({ example: true })
    @IsOptional()
    @IsBoolean()
    verificado: boolean;

    @ApiProperty({ example: "foto" })
    @IsString()
    imagenCI: string;

    @ApiProperty({ example: "foto" })
    @IsString()
    imagenFacial: string;
}
