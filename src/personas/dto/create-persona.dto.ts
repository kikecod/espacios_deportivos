import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsArray, ArrayMaxSize } from 'class-validator';
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

  @ApiProperty({ required: false, type: String, maxLength: 1000 })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false, maxLength: 180 })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiProperty({ required: false, maxLength: 120 })
  @IsOptional()
  @IsString()
  ocupacion?: string;

  @ApiProperty({ required: false, type: [String], description: 'Lista de deportes favoritos' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @Type(() => String)
  deportesFavoritos?: string[];
}
