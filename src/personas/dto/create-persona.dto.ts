import { IsString, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { TipoDocumento, Genero } from '../persona.enum';

export class CreatePersonaDto {
  @IsString()
  nombres: string;

  @IsString()
  paterno: string;

  @IsString()
  materno: string;

  @IsEnum(TipoDocumento)
  documentoTipo: TipoDocumento;

  
  @IsString()
  documentoNumero: string;

  @IsString()
  telefono: string;


  @IsBoolean()
  telefonoVerificado: boolean;

  @IsDateString()
  fechaNacimiento: string;

  @IsEnum(Genero)
  genero: Genero;

  @IsString()
  urlFoto: string;
}