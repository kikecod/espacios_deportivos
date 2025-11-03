import { ApiProperty } from "@nestjs/swagger";

export class ValidarResenaDto {
  @ApiProperty({ 
    description: 'Indica si el cliente puede dejar una reseña',
    example: true 
  })
  puedeResenar: boolean;
  
  @ApiProperty({ 
    description: 'Razón por la que no puede reseñar (si aplica)',
    required: false,
    example: 'Ya dejaste una reseña para esta cancha'
  })
  razon?: string;
  
  @ApiProperty({ 
    description: 'Días restantes para poder reseñar',
    required: false,
    example: 10
  })
  diasRestantes?: number;
  
  @ApiProperty({ 
    description: 'Fecha límite para reseñar (14 días después del fin de la reserva)',
    required: false,
    type: 'string',
    format: 'date-time'
  })
  fechaLimite?: Date;
}
