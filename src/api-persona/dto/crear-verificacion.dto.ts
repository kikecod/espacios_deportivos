import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearVerificacionDto {
  @ApiProperty({
    description: 'ID de referencia para la verificación (CI del dueño)',
    example: '12345678',
  })
  @IsNotEmpty()
  @IsString()
  referenceId: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales para la verificación',
    example: { nombre: 'Juan Pérez', email: 'juan@example.com' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
