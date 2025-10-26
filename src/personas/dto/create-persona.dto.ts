import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
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
  documento_tipo?: TipoDocumento;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @IsString()
  documento_numero?: string;

  @ApiProperty({ maxLength: 15 })
  @IsString()
  telefono: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  telefono_verificado?: boolean;

  @ApiProperty({ maxLength: 100 })
  @IsDateString()
  fecha_nacimiento: string;

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  genero: Genero;

  @ApiProperty({ required: false, maxLength: 200 })
  @IsOptional()
  @IsString()
  url_foto?: string;
}
