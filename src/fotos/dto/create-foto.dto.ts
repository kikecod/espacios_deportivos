import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, IsString } from "class-validator";


export class CreateFotoDto {
    @ApiProperty({example: 1})
    @IsInt()
    @IsPositive()
    id_cancha: number;

    @ApiProperty({example: "http://misitio.com/mi-foto.jpg"})
    @IsString()
    url_foto: string;
}
