import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class LibelulaCallbackDto {
  @ApiProperty({
    description: 'Identificador de la transaccion enviado por Libelula',
    example: 'LIB-20250101-ABC123',
  })
  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @ApiProperty({
    description: 'Identificador de la factura emitida por Libelula',
    example: 'FAC-724553',
    required: false,
  })
  @IsOptional()
  @IsString()
  invoice_id?: string;

  @ApiProperty({
    description: 'URL publica de la factura generada por Libelula',
    example: 'https://api.libelula.bo/invoices/FAC-724553.pdf',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  invoice_url?: string;

  @ApiProperty({
    description: 'Estado reportado por la pasarela',
    example: 'PAGADO',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}
