import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsDateString,
  Matches,
  IsInt,
  Min,
  Max,
  IsIn,
  IsNumber,
} from 'class-validator';

export class SearchMainDto {
  // ============================================
  // FECHA Y HORA
  // ============================================
  @ApiProperty({
    required: false,
    example: '2025-11-08',
    description: 'Fecha de la reserva (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({
    required: false,
    example: '14:00',
    description: 'Hora de inicio (HH:mm)',
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe estar en formato HH:mm',
  })
  horaInicio?: string;

  @ApiProperty({
    required: false,
    example: '16:00',
    description: 'Hora de fin (HH:mm)',
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaFin debe estar en formato HH:mm',
  })
  horaFin?: string;

  // ============================================
  // DISCIPLINA
  // ============================================
  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID de la disciplina',
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsInt()
  idDisciplina?: number;

  // ============================================
  // SEDE
  // ============================================
  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID de la sede',
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsInt()
  idSede?: number;

  // ============================================
  // PAGINACIÓN Y ORDENAMIENTO
  // ============================================
  @ApiProperty({
    required: false,
    example: 1,
    description: 'Número de página',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Resultados por página',
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    example: 'rating',
    description: 'Campo por el cual ordenar',
    enum: ['precio', 'rating', 'nombre'],
    default: 'rating',
  })
  @IsOptional()
  @IsIn(['precio', 'rating', 'nombre'])
  sortBy?: string = 'rating';

  @ApiProperty({
    required: false,
    example: 'desc',
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';
}
