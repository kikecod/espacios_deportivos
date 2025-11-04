import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioProfileDto {
  @ApiProperty({ 
    required: false,
    example: 'nuevo@email.com',
    description: 'Nuevo correo electrónico del usuario'
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  correo?: string;

  @ApiProperty({ 
    required: false,
    example: 'nuevo_usuario',
    description: 'Nuevo nombre de usuario'
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre de usuario no puede tener más de 50 caracteres' })
  usuario?: string;
}
