import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, Length } from 'class-validator';
import { TipoDocumento, Genero } from '../entities/personas.entity';

export class CreatePersonaDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @Length(1, 100)
  nombres: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @Length(1, 100)
  paterno: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @Length(1, 100)
  materno: string;

  @ApiProperty({ enum: TipoDocumento, required: false })
  @IsOptional()
  @IsEnum(TipoDocumento)
  documentoTipo?: TipoDocumento;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  documentoNumero?: string;

  @ApiProperty({ maxLength: 15 })
  @IsString()
  @Length(7, 15)
  telefono: string;

  @ApiProperty({ required: false, description: 'Si el teléfono fue verificado' })
  @IsOptional()
  @IsBoolean()
  telefonoVerificado?: boolean;

  @ApiProperty({
    example: '2000-05-15',
    description: 'Fecha de nacimiento en formato YYYY-MM-DD',
  })
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  genero: Genero;

  @ApiProperty({ required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  urlFoto?: string;
}
