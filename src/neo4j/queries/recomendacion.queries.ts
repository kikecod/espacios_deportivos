/**
 * Queries Cypher para el sistema de recomendaciones
 */

/**
 * Crear relación RESERVO entre usuario y cancha
 * Parámetros: { idUsuario, idCancha, fecha, precioReserva, completada }
 * NOTA: Usa CREATE para crear múltiples relaciones (una por cada reserva)
 */
export const CREATE_RELACION_RESERVO = `
  MATCH (u:PerfilUsuario {idUsuario: $idUsuario})
  MATCH (e:EspacioDeportivo {idCancha: $idCancha})
  CREATE (u)-[r:RESERVO {
    fecha: datetime($fecha),
    precioReserva: $precioReserva,
    completada: $completada
  }]->(e)
  RETURN r
`;

/**
 * Crear relación CALIFICO entre usuario y cancha
 * Parámetros: { idUsuario, idCancha, rating, fecha, comentario }
 */
export const CREATE_RELACION_CALIFICO = `
  MATCH (u:PerfilUsuario {idUsuario: $idUsuario})
  MATCH (e:EspacioDeportivo {idCancha: $idCancha})
  MERGE (u)-[r:CALIFICO]->(e)
  SET r.rating = $rating,
      r.fecha = datetime($fecha),
      r.comentario = $comentario
  RETURN r
`;

/**
 * Crear relación SIMILAR_A entre dos canchas (pre-cálculo)
 * Parámetros: { idCancha1, idCancha2, similitudCoseno, similitudJaccard, similitudTotal, calculadoEn }
 */
export const CREATE_RELACION_SIMILAR = `
  MATCH (e1:EspacioDeportivo {idCancha: $idCancha1})
  MATCH (e2:EspacioDeportivo {idCancha: $idCancha2})
  MERGE (e1)-[r:SIMILAR_A]->(e2)
  SET r.similitudCoseno = $similitudCoseno,
      r.similitudJaccard = $similitudJaccard,
      r.similitudTotal = $similitudTotal,
      r.calculadoEn = datetime($calculadoEn)
  RETURN r
`;

/**
 * Obtener canchas candidatas basadas en similitud pre-calculada
 * Parámetros: { idUsuario, limite }
 */
export const GET_CANCHAS_CANDIDATAS = `
  MATCH (u:PerfilUsuario {idUsuario: $idUsuario})-[:RESERVO]->(c1:EspacioDeportivo)
  WHERE c1.activo = true
  MATCH (c1)-[s:SIMILAR_A]->(c2:EspacioDeportivo)
  WHERE c2.activo = true 
    AND NOT (u)-[:RESERVO]->(c2)
  RETURN DISTINCT c2,
         s.similitudTotal as score,
         collect(DISTINCT c1.nombre)[0..3] as basadoEn
  ORDER BY score DESC
  LIMIT $limite
`;

/**
 * Obtener canchas candidatas sin pre-cálculo (trae info completa)
 * Parámetros: { idUsuario, limite }
 */
export const GET_CANCHAS_PARA_CALCULAR = `
  MATCH (u:PerfilUsuario {idUsuario: $idUsuario})-[:RESERVO]->(c1:EspacioDeportivo)
  WHERE c1.activo = true
  WITH u, collect(DISTINCT c1.idCancha) as reservadas
  MATCH (c:EspacioDeportivo)
  WHERE c.activo = true 
    AND NOT c.idCancha IN reservadas
  RETURN c
  LIMIT $limite
`;

/**
 * Obtener canchas populares (para usuarios nuevos sin historial)
 * Parámetros: { limite }
 */
export const GET_CANCHAS_POPULARES = `
  MATCH (e:EspacioDeportivo)
  WHERE e.activo = true
  WITH e, 
       SIZE((e)<-[:RESERVO]-()) as totalReservas,
       e.ratingPromedio as rating
  RETURN e
  ORDER BY rating DESC, totalReservas DESC
  LIMIT $limite
`;

/**
 * Obtener historial de reservas de un usuario
 * Parámetros: { idUsuario }
 */
export const GET_HISTORIAL_RESERVAS = `
  MATCH (u:PerfilUsuario {idUsuario: $idUsuario})-[r:RESERVO]->(e:EspacioDeportivo)
  WHERE r.completada = true
  RETURN e, r
  ORDER BY r.fecha DESC
`;

/**
 * Obtener calificaciones de un usuario
 * Parámetros: { idUsuario }
 */
export const GET_CALIFICACIONES_USUARIO = `
  MATCH (u:PerfilUsuario {idUsuario: $idUsuario})-[r:CALIFICO]->(e:EspacioDeportivo)
  RETURN e, r
  ORDER BY r.fecha DESC
`;

/**
 * Verificar si un usuario ya reservó una cancha
 * Parámetros: { idUsuario, idCancha }
 */
export const YA_RESERVO_CANCHA = `
  MATCH (u:PerfilUsuario {idUsuario: $idUsuario})-[r:RESERVO]->(e:EspacioDeportivo {idCancha: $idCancha})
  RETURN count(r) > 0 as yaReservo
`;

/**
 * Obtener canchas similares a una específica
 * Parámetros: { idCancha, limite }
 */
export const GET_CANCHAS_SIMILARES = `
  MATCH (c1:EspacioDeportivo {idCancha: $idCancha})-[s:SIMILAR_A]->(c2:EspacioDeportivo)
  WHERE c2.activo = true
  RETURN c2, s.similitudTotal as score
  ORDER BY score DESC
  LIMIT $limite
`;
