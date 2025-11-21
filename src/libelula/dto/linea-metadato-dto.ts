// libelula/dto/linea-metadato.dto.ts
import { IsString } from 'class-validator';

export class LineaMetadatoDto {
  @IsString()
  nombre: string;

  @IsString()
  dato: string;
}