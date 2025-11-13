import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCalificaSedeDto {
  
  @IsInt()
  @IsNotEmpty()
  idSede: number;

  @IsInt()
  @IsNotEmpty()
  idReserva: number;

  // ============================================
  // CALIFICACIÓN GENERAL (obligatoria)
  // ============================================
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  puntajeGeneral: number;

  // ============================================
  // ASPECTOS ESPECÍFICOS (opcionales)
  // ============================================
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  atencion?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  instalaciones?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  ubicacion?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  estacionamiento?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  vestuarios?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  limpieza?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  seguridad?: number;

  // ============================================
  // COMENTARIO (opcional)
  // ============================================
  @IsOptional()
  @IsString()
  comentario?: string;
}
