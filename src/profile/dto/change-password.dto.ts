import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  contrasenaActual: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  nuevaContrasena: string;
}
