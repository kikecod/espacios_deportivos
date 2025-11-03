import { ApiProperty } from "@nestjs/swagger";

export class ResenaResponseDto {
  @ApiProperty({ description: 'ID del cliente que dejó la reseña' })
  idCliente: number;
  
  @ApiProperty({ description: 'ID de la cancha reseñada' })
  idCancha: number;
  
  @ApiProperty({ description: 'ID de la reserva que originó la reseña' })
  idReserva: number;
  
  @ApiProperty({ 
    description: 'Información del cliente que reseñó',
    type: 'object',
    properties: {
      nombre: { type: 'string' },
      avatar: { type: 'string' }
    }
  })
  cliente: {
    nombre: string;
    avatar: string;
  };
  
  @ApiProperty({ description: 'Calificación (1-5 estrellas)', minimum: 1, maximum: 5 })
  puntaje: number;
  
  @ApiProperty({ description: 'Comentario de la reseña', required: false })
  comentario?: string;
  
  @ApiProperty({ description: 'Fecha en que se creó la reseña' })
  creadaEn: Date;
  
  @ApiProperty({ description: 'Fecha de última edición', required: false })
  editadaEn?: Date;

  @ApiProperty({ description: 'Estado de la reseña', enum: ['ACTIVA', 'ELIMINADA'] })
  estado: string;
}
