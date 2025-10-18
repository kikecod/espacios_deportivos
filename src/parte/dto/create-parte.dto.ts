import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsPositive } from "class-validator";

export class CreateParteDto {

    @ApiProperty({example: 1})
    @IsInt()
    @IsPositive()
    id_disciplina: number;

    @ApiProperty({example: 1})
    @IsInt()
    @IsPositive()
    id_cancha: number;
}
