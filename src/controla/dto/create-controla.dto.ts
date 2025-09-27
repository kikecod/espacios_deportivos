import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";


export class CreateControlaDto {

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    idPersonaOpe: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    idReserva: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    idPaseAcceso: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    accion: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    resultado: string;

}
