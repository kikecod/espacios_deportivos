import { Injectable } from '@nestjs/common';
import { PerfilUsuario } from 'src/neo4j/interfaces/perfil-usuario.interface';

@Injectable()
export class PerfilUsuarioTransformer {
  /**
   * Transforma datos de reservas y calificaciones de PostgreSQL a un PerfilUsuario para Neo4j
   * @param idUsuario - ID del usuario (viene de la tabla usuarios)
   * @param reservas - Array de reservas completadas del usuario
   * @param calificaciones - Array de calificaciones del usuario
   */
  fromReservasYCalificaciones(
    idUsuario: number,
    reservas: any[],
    calificaciones: any[],
  ): PerfilUsuario {
    // Calcular precio promedio de las reservas
    const precioPromedio =
      reservas.length > 0
        ? reservas.reduce((sum, r) => sum + parseFloat(r.montoTotal || 0), 0) /
          reservas.length
        : 0;

    // Calcular valoración promedio que da el usuario
    const valoracionPromedio =
      calificaciones.length > 0
        ? calificaciones.reduce((sum, c) => sum + (c.puntaje || 0), 0) /
          calificaciones.length
        : 0;

    // Extraer disciplinas únicas de las canchas reservadas
    const disciplinasSet = new Set<number>();
    reservas.forEach((reserva) => {
      if (reserva.cancha && reserva.cancha.parte) {
        reserva.cancha.parte.forEach((parte: any) => {
          if (parte.idDisciplina) {
            disciplinasSet.add(parte.idDisciplina);
          }
        });
      }
    });

    return {
      idUsuario,
      precioPromedio: parseFloat(precioPromedio.toFixed(2)),
      valoracionPromedio: parseFloat(valoracionPromedio.toFixed(2)),
      disciplinasPreferidas: Array.from(disciplinasSet),
      totalReservas: reservas.length,
      totalCalificaciones: calificaciones.length,
      ultimaActualizacion: new Date(),
    };
  }

  /**
   * Transforma un perfil simple (para usuarios sin historial)
   */
  perfilVacio(idUsuario: number): PerfilUsuario {
    return {
      idUsuario,
      precioPromedio: 0,
      valoracionPromedio: 0,
      disciplinasPreferidas: [],
      totalReservas: 0,
      totalCalificaciones: 0,
      ultimaActualizacion: new Date(),
    };
  }
}
