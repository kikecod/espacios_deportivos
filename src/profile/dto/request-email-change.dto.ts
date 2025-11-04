import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RequestEmailChangeDto {
  @IsEmail()
  nuevoCorreo: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  contrasenaActual: string;
}
