import { Injectable } from '@nestjs/common';
import { EspacioDeportivo } from 'src/neo4j/interfaces/espacio-deportivo.interface';

@Injectable()
export class EspacioDeportivoTransformer {
  /**
   * Transforma una entidad Cancha de PostgreSQL a EspacioDeportivo para Neo4j
   * @param cancha - Entidad Cancha con sus relaciones
   */
  fromCancha(cancha: any): EspacioDeportivo {
    // Extraer IDs de disciplinas de la relación Parte
    const disciplinas: number[] = [];
    if (cancha.parte && Array.isArray(cancha.parte)) {
      cancha.parte.forEach((parte: any) => {
        if (parte.idDisciplina) {
          disciplinas.push(parte.idDisciplina);
        }
      });
    }

    return {
      idCancha: cancha.idCancha,
      nombre: cancha.nombre || '',
      precio: parseFloat(cancha.precio || 0),
      ratingPromedio: parseFloat(cancha.ratingPromedio || 0),
      disciplinas: disciplinas,
      superficie: cancha.superficie || '',
      activo: !cancha.eliminadoEn, // Si no tiene fecha de eliminación, está activo
      idSede: cancha.id_Sede || cancha.idSede,
      ultimaActualizacion: new Date(),
    };
  }

  /**
   * Valida que una cancha tenga los datos mínimos necesarios
   */
  isValid(cancha: any): boolean {
    return !!(
      cancha &&
      cancha.idCancha &&
      cancha.nombre &&
      cancha.precio !== undefined &&
      cancha.superficie
    );
  }
}
