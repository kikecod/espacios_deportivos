import { IsDate, IsInt, IsString } from "class-validator";


export class CreateControlaDto {

    @IsInt()
    idPersonaOpe: number;

    @IsInt()
    idReserva: number;

    @IsInt()
    idPasajero: number;

    @IsString()
    accion: string;

    @IsString()
    resultado: string;

    @IsDate()
    fecha: Date;

}
