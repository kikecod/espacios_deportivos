import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, IsNumber, IsOptional, IsDateString } from "class-validator";

export class CreateTransaccioneDto {

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    idTransaccion?: number;

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
    @IsNumber()
    monto: number;

    @ApiProperty({ example: 'completado' })
    @IsString()
    estado: string;

    @ApiProperty({ example: 'ext123456' })
    @IsString() 
    idExterno: string;

    @ApiProperty({ example: 3.50 })
    @IsNumber()
    comisionPasarela: number;

    @ApiProperty({ example: 2.00 })
    @IsNumber()
    comisionPlataforma: number;

    @ApiProperty({ example: 'USD' })   
    @IsString() 
    monedaLiquidada: string;

    @ApiProperty({ example: 'auth7890' })
    @IsString()
    codigoAutorizacion: string;

    @ApiProperty({ example: '2025-09-26T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    creadoEn?: Date;

    @ApiProperty({ example: '2025-09-26T08:05:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    capturadoEn?: Date;

    @ApiProperty({ example: '2025-09-27T10:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    rembolsadoEn?: Date;

}
