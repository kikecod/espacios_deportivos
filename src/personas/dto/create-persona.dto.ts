import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { TipoDocumento, Genero } from '../personas.entity';

export class CreatePersonaDto {
  @IsNotEmpty()
  @IsString()
  nombres: string;

  @IsNotEmpty()
  @IsString()
  paterno: string;

  @IsNotEmpty()
  @IsString()
  materno: string;

  @IsEnum(TipoDocumento)
  documentoTipo: TipoDocumento;

  @IsNotEmpty()
  @IsString()
  documentoNumero: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  telefonoVerificado?: boolean;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(Genero)
  genero?: Genero;

  @IsOptional()
  @IsString()
  urlFoto?: string;
}