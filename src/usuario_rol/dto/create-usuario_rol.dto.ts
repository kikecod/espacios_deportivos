import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class CreateUsuarioRolDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idUsuario: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idRol: number;
}
