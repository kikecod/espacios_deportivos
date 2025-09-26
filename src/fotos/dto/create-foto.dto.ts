import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, IsString } from "class-validator";


export class CreateFotoDto {
    @ApiProperty({example: 1})
    @IsInt()
    @IsPositive()
    idCancha: number;

    @ApiProperty({example: "http://misitio.com/mi-foto.jpg"})
    @IsString()
    urlFoto: string;
}
