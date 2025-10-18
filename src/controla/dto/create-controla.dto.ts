import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";


export class CreateControlaDto {

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    id_persona_ope: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    id_reserva: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    id_pase_acceso: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    accion: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    resultado: string;

}
