import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";


export class CreateControladorDto {

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    idPersonaOpe: number;

    // La relación con Sede se gestiona mediante la entidad Trabaja, no aquí.

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    codigoEmpleado: string;

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean = true;

    @ApiProperty()
    @IsString()
    turno: string;
}
