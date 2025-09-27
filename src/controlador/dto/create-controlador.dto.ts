import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";


export class CreateControladorDto {

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    idPersonaOpe: number;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    idSede: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    codigoEmpleado: string;

    @ApiProperty()
    @IsBoolean()
    activo: boolean;

    @ApiProperty()
    @IsString()
    turno: string;
}
