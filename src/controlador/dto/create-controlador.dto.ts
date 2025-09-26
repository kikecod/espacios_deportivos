import { IsBoolean, IsInt, IsPositive, IsString } from "class-validator";


export class CreateControladorDto {

    @IsInt()
    idPersonaOpe: number;

    @IsInt()
    @IsPositive()
    idSede: number;

    @IsString()
    codigoEmpleado: string;

    @IsBoolean()
    activo: boolean;

    @IsString()
    turno: string;
}
