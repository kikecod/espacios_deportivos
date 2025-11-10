import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class ValidarQRDto {
    
    @ApiProperty({ 
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Código QR único generado para el pase de acceso'
    })
    @IsString()
    @IsNotEmpty()
    codigoQR: string;

    @ApiProperty({ 
        example: 5,
        description: 'ID del controlador que realiza la validación'
    })
    @IsInt()
    @IsPositive()
    idControlador: number;

    @ApiProperty({ 
        example: 'entrada',
        enum: ['entrada', 'salida'],
        description: 'Tipo de acción: entrada o salida'
    })
    @IsEnum(['entrada', 'salida'])
    accion: string;
}
