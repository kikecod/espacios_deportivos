import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { EstadoPase } from "../entities/pases_acceso.entity";

export class CreatePasesAccesoDto {
    
    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idPaseAcceso?: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    @IsPositive()
    idReserva: number;

    @ApiProperty({ example: 'abc123xyz456' })
    @IsString()
    hashCode: string;

    @ApiProperty({ example: '2025-09-27T10:00:00.000Z' })
    @IsDateString()
    validoDesde: Date;

    @ApiProperty({ example: '2025-09-27T12:00:00.000Z' })
    @IsDateString()
    validoHasta: Date;

    @ApiProperty({ enum: EstadoPase, example: EstadoPase.ACTIVO })
    @IsEnum(EstadoPase)
    estado: EstadoPase;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    creadoEn?: Date;
}
