import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateTransaccioneDto {

    @ApiProperty({ example: 1 })
    @IsInt()
    idTransaccion: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    idReserva: number;

    @ApiProperty({ example: 'Stripe' })
    @IsString()
    pasarela: string;

    @ApiProperty({ example: 'credit_card' })
    @IsString()
    metodo: string;

    @ApiProperty({ example: 150.75 })
    @IsInt()
    monto: number;

    @ApiProperty({ example: 'completado' })
    @IsString()
    estado: string;

    @ApiProperty({ example: 'ext123456' })
    @IsString() 
    idExterno: string;

    @ApiProperty({ example: 3.50 })
    @IsInt()
    comisionPasarela: number;

    @ApiProperty({ example: 2.00 })
    @IsInt()
    comisionPlataforma: number;

    @ApiProperty({ example: 'USD' })   
    @IsString() 
    monedaLiquidada: string;

    @ApiProperty({ example: 'auth7890' })
    @IsString()
    codigoAutorizacion: string;

    @ApiProperty({ example: '2025-09-26T08:00:00.000Z' })
    @IsString()
    creadoEn: Date;

    @ApiProperty({ example: '2025-09-26T08:05:00.000Z' })
    @IsString()
    capturadoEn: Date;

    @ApiProperty({ example: '2025-09-27T10:00:00.000Z' })
    @IsString()
    rembolsadoEn: Date;

}
