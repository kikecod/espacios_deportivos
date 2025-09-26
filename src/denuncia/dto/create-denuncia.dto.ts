// create-denuncia.dto.ts
import { IsDate, IsInt, IsString } from 'class-validator';

export class CreateDenunciaDto {
    @IsInt()
    idCliente: number;

    @IsInt()
    idCancha: number;

    @IsInt()
    idSede: number;

    @IsString()
    categoria: string;

    @IsString()
    gravedad: string;

    @IsString()
    estado: string; // default = pendiente -> no se como poner eso unu

    @IsString()
    titulo: string;

    @IsString()
    descripcion: string;

    @IsString()
    asignadoA: string;

}
