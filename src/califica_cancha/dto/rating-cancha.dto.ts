import { ApiProperty } from "@nestjs/swagger";
import { ResenaResponseDto } from "./resena-response.dto";

export class RatingCanchaDto {
  @ApiProperty({ description: 'Rating promedio de la cancha', example: 4.75 })
  ratingPromedio: number;
  
  @ApiProperty({ description: 'Total de reseñas activas', example: 23 })
  totalResenas: number;
  
  @ApiProperty({ 
    description: 'Distribución de calificaciones por estrellas',
    example: { 5: 18, 4: 4, 3: 1, 2: 0, 1: 0 }
  })
  distribucion: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  
  @ApiProperty({ 
    description: 'Lista de reseñas',
    type: [ResenaResponseDto] 
  })
  resenas: ResenaResponseDto[];
  
  @ApiProperty({
    description: 'Información de paginación',
    type: 'object',
    properties: {
      pagina: { type: 'number', example: 1 },
      limite: { type: 'number', example: 10 },
      total: { type: 'number', example: 23 },
      totalPaginas: { type: 'number', example: 3 }
    }
  })
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}
