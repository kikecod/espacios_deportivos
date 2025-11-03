import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  contrasenaActual: string;

  @IsString()
  @Matches(/^ELIMINAR$/i, { message: 'La confirmación debe ser la palabra ELIMINAR' })
  confirmacion: string;
}
