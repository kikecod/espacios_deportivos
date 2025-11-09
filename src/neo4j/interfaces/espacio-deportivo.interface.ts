export interface EspacioDeportivo {
  idCancha: number;
  nombre: string;
  precio: number;
  ratingPromedio: number;
  disciplinas: number[];
  superficie: string;
  activo: boolean;
  idSede: number;
  ultimaActualizacion: Date;
}
