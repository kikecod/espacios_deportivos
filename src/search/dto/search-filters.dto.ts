import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsBoolean, IsString, Min, Max } from 'class-validator';
import { SearchMainDto } from './search-main.dto';

export class SearchFiltersDto extends SearchMainDto {
  // ============================================
  // FILTROS DE PRECIO
  // ============================================
  @ApiProperty({
    required: false,
    example: 50,
    description: 'Precio mínimo',
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  precioMin?: number;

  @ApiProperty({
    required: false,
    example: 200,
    description: 'Precio máximo',
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  precioMax?: number;

  // ============================================
  // FILTRO DE RATING
  // ============================================
  @ApiProperty({
    required: false,
    example: 4.0,
    description: 'Rating mínimo (0-5)',
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(5)
  ratingMin?: number;

  // ============================================
  // CARACTERÍSTICAS DE CANCHA
  // ============================================
  @ApiProperty({
    required: false,
    example: true,
    description: 'Filtrar por cancha cubierta',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  cubierta?: boolean;

  @ApiProperty({
    required: false,
    example: 'Césped sintético',
    description: 'Tipo de superficie',
  })
  @IsOptional()
  @IsString()
  superficie?: string;

  @ApiProperty({
    required: false,
    example: 'LED',
    description: 'Tipo de iluminación',
  })
  @IsOptional()
  @IsString()
  iluminacion?: string;

  // ============================================
  // FILTROS DE AFORO
  // ============================================
  @ApiProperty({
    required: false,
    example: 10,
    description: 'Aforo mínimo',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  aforoMin?: number;

  @ApiProperty({
    required: false,
    example: 22,
    description: 'Aforo máximo',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  aforoMax?: number;
}
