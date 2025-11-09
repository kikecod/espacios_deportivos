export interface EspacioDeportivo {
  idCancha: number;
  nombre: string;
  ubicacion: string;
  precioPorHora: number;
  disciplinas: string[];
  ratingPromedio: number;
  cantidadResenas: number;
  activa: boolean;
  ultimaActualizacion: Date;
}
