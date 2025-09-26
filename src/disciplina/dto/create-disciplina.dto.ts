import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateDisciplinaDto {

    @ApiProperty({example: "Futbol"})
    @IsString()
    @IsOptional()
    @MinLength(3)
    nombre: string;
    
    @ApiProperty({example: "Futbol"})
    @IsString()
    @IsOptional()
    @MinLength(3)
    categoria: string;

    @ApiProperty({example: "Futbol"})
    @IsString()
    @IsOptional()
    @MinLength(3)
    descripcion: string;
}
