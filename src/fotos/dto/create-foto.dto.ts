import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateFotoDto {
    
    @ApiProperty({ example: 'cancha', enum: ['sede', 'cancha'] })
    @IsEnum(['sede', 'cancha'])
    tipo: 'sede' | 'cancha';

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idSede?: number;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idCancha?: number;

    @ApiProperty({ example: "http://misitio.com/mi-foto.jpg" })
    @IsString()
    urlFoto: string;
}
