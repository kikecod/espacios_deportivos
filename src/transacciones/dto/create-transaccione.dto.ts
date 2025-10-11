import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, IsDateString, IsEnum } from "class-validator";
import { EstadoTransaccion } from '../entities/transaccion.entity';
import { Type } from 'class-transformer';

export class CreateTransaccioneDto {

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
    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @IsPositive()
    monto: number;

    @ApiProperty({ enum: EstadoTransaccion, example: EstadoTransaccion.PENDIENTE })
    @IsEnum(EstadoTransaccion)
    estado: EstadoTransaccion;

    @ApiProperty({ example: 'ext123456' })
    @IsString() 
    idExterno: string;

    @ApiProperty({ example: 3.50 })
    @Type(() => Number)
    @IsNumber()
    comisionPasarela: number;

    @ApiProperty({ example: 2.00 })
    @Type(() => Number)
    @IsNumber()
    comisionPlataforma: number;

    @ApiProperty({ example: 'USD' })   
    @IsString() 
    monedaLiquidada: string;

    @ApiProperty({ example: 'auth7890' })
    @IsString()
    codigoAutorizacion: string;

    @ApiProperty({ example: '2025-09-27T10:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    rembolsadoEn?: string;

}
