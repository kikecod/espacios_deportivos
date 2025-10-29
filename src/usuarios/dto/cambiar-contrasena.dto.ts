import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarContrasenaDto {
  @ApiProperty({ 
    example: 'nuevaPassword123',
    description: 'Nueva contraseña del usuario (8-20 caracteres)'
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(20, { message: 'La contraseña no puede tener más de 20 caracteres' })
  nuevaContrasena: string;
}
