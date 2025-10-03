import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { TipoDocumento, Genero } from '../entities/personas.entity';

export class CreatePersonaDto {

  @ApiProperty({ maxLength: 50 })
  @IsString()
  nombres: string;

  @ApiProperty({ maxLength: 50 }) 
  @IsString()
  paterno: string;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  materno: string;

  @ApiProperty({ enum: TipoDocumento, required: false })
  @IsOptional()
  @IsEnum(TipoDocumento)
  documentoTipo?: TipoDocumento;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @IsString()
  documentoNumero?: string;

  @ApiProperty({ maxLength: 15 })
  @IsString()
  telefono: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  telefonoVerificado?: boolean;

  @ApiProperty({ maxLength: 100 })
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  genero: Genero;

  @ApiProperty({ required: false, maxLength: 200 })
  @IsOptional()
  @IsString()
  urlFoto?: string;
}