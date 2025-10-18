import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateTransaccioneDto {

    @ApiProperty({ example: 1 })
    @IsInt()
    id_transaccion: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    id_reserva: number;

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
    id_externo: string;

    @ApiProperty({ example: 3.50 })
    @IsInt()
    comision_pasarela: number;

    @ApiProperty({ example: 2.00 })
    @IsInt()
    comision_plataforma: number;

    @ApiProperty({ example: 'USD' })   
    @IsString() 
    moneda_liquidada: string;

    @ApiProperty({ example: 'auth7890' })
    @IsString()
    codigo_autorizacion: string;

    @ApiProperty({ example: '2025-09-26T08:00:00.000Z' })
    @IsString()
    creado_en: Date;

    @ApiProperty({ example: '2025-09-26T08:05:00.000Z' })
    @IsString()
    capturado_en: Date;

    @ApiProperty({ example: '2025-09-27T10:00:00.000Z' })
    @IsString()
    rembolsado_en: Date;

}
