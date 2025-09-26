import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsPositive, IsString } from "class-validator";

export class CreatePasesAccesoDto {
    
    @ApiProperty({ example: 1 })
    @IsInt()
    @IsPositive()
    idPaseAcceso: number;

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

    @ApiProperty({ example: 'activo' })
    @IsString()
    estado: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    @IsDateString()
    creadoEn: Date;
}
