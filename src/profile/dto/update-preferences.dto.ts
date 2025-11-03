import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  mostrarEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  mostrarTelefono?: boolean;

  @IsOptional()
  @IsBoolean()
  perfilPublico?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarReservas?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarPromociones?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarRecordatorios?: boolean;

  @IsOptional()
  @IsBoolean()
  modoOscuro?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  idioma?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  zonaHoraria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  firmaReserva?: string;
}
