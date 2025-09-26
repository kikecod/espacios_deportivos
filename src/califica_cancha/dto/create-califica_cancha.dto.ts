import { IsDate, IsInt, IsString, Max, Min } from "class-validator";


export class CreateCalificaCanchaDto {
    @IsInt()
    idCliente: number;

    @IsInt()
    idCancha: number;

    @IsInt()
    idSede: number;

    @IsInt()
    @Min(1)
    @Max(5)
    puntaje: number;

    @IsString()
    dimensiones: string;

    @IsString()
    comentario: string;

}
