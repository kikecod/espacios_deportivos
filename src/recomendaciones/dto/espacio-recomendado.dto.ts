/**
 * DTO para un espacio deportivo recomendado
 */
export class EspacioRecomendadoDto {
  idCancha: number;
  nombre: string;
  ubicacion: string;
  precioPorHora: number;
  disciplinas: string[];
  ratingPromedio: number;
  cantidadResenas: number;
  activa: boolean;
  score: number; // Puntuación de similitud (0-1)
  razonRecomendacion?: string; // Por qué se recomienda
  basadoEn?: string[]; // Canchas en las que se basa la recomendación
}

/**
 * DTO para respuesta de recomendaciones
 */
export class RecomendacionesResponseDto {
  total: number;
  recomendaciones: EspacioRecomendadoDto[];
  metodo: 'content-based' | 'popular' | 'similar';
  mensaje?: string;
}
