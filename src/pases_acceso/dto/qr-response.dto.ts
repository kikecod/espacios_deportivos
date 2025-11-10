import { ApiProperty } from "@nestjs/swagger";

export class QRResponseDto {
    
    @ApiProperty({ 
        example: 'iVBORw0KGgoAAAANSUhEUgAA...',
        description: 'Imagen QR en formato base64'
    })
    qr: string;

    @ApiProperty({ 
        example: 'base64',
        description: 'Formato del QR'
    })
    formato: string;

    @ApiProperty({ 
        example: 'image/png',
        description: 'Tipo MIME de la imagen'
    })
    tipo: string;
}
