import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsPositive } from "class-validator";

export class CreateParteDto {

    @ApiProperty({example: 1})
    @IsInt()
    @IsPositive()
    idDisciplina: number;

    @ApiProperty({example: 1})
    @IsInt()
    @IsPositive()
    idCancha: number;
}
