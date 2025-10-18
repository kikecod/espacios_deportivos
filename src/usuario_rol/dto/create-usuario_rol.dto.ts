import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class CreateUsuarioRolDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    id_usuario: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    id_rol: number;
}
