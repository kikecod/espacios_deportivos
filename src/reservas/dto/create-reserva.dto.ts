import { IsInt } from "class-validator";

export class CreateReservaDto {
    @IsInt()
    idCliente: number;
    @IsInt()
    idCancha: number
    iniciaEn: Date;
    terminaEn: Date;
    @IsInt()
    cantidadPersonas: number;
    requiereAprobacion: boolean;
    @IsInt()
    montoBase: number;
    @IsInt()
    montoExtra: number;
    @IsInt()
    montoTotal: number;
}
