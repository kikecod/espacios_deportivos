/**
 * Queries Cypher para operaciones relacionadas con EspacioDeportivo
 */

/**
 * Crear o actualizar un nodo EspacioDeportivo
 * Parámetros: { idCancha, nombre, precio, ratingPromedio, disciplinas, superficie, activo, idSede, ultimaActualizacion }
 */
export const CREATE_OR_UPDATE_ESPACIO_DEPORTIVO = `
  MERGE (e:EspacioDeportivo {idCancha: $idCancha})
  SET e.nombre = $nombre,
      e.precio = $precio,
      e.ratingPromedio = $ratingPromedio,
      e.disciplinas = $disciplinas,
      e.superficie = $superficie,
      e.activo = $activo,
      e.idSede = $idSede,
      e.ultimaActualizacion = datetime($ultimaActualizacion)
  RETURN e
`;

/**
 * Crear un nodo EspacioDeportivo
 * Parámetros: { idCancha, nombre, precio, ratingPromedio, disciplinas, superficie, activo, idSede, ultimaActualizacion }
 */
export const CREATE_ESPACIO_DEPORTIVO = `
  CREATE (e:EspacioDeportivo {
    idCancha: $idCancha,
    nombre: $nombre,
    precio: $precio,
    ratingPromedio: $ratingPromedio,
    disciplinas: $disciplinas,
    superficie: $superficie,
    activo: $activo,
    idSede: $idSede,
    ultimaActualizacion: datetime($ultimaActualizacion)
  })
  RETURN e
`;

/**
 * Actualizar propiedades de un nodo EspacioDeportivo
 * Parámetros: { idCancha, nombre, precio, ratingPromedio, disciplinas, superficie, activo, idSede, ultimaActualizacion }
 */
export const UPDATE_ESPACIO_DEPORTIVO = `
  MATCH (e:EspacioDeportivo {idCancha: $idCancha})
  SET e.nombre = $nombre,
      e.precio = $precio,
      e.ratingPromedio = $ratingPromedio,
      e.disciplinas = $disciplinas,
      e.superficie = $superficie,
      e.activo = $activo,
      e.idSede = $idSede,
      e.ultimaActualizacion = datetime($ultimaActualizacion)
  RETURN e
`;

/**
 * Obtener espacio deportivo por ID
 * Parámetros: { idCancha }
 */
export const GET_ESPACIO_DEPORTIVO = `
  MATCH (e:EspacioDeportivo {idCancha: $idCancha})
  RETURN e
`;

/**
 * Verificar si existe un espacio deportivo
 * Parámetros: { idCancha }
 */
export const EXISTS_ESPACIO_DEPORTIVO = `
  MATCH (e:EspacioDeportivo {idCancha: $idCancha})
  RETURN count(e) > 0 as exists
`;

/**
 * Marcar un espacio deportivo como inactivo (soft delete)
 * Parámetros: { idCancha }
 */
export const SET_INACTIVO = `
  MATCH (e:EspacioDeportivo {idCancha: $idCancha})
  SET e.activo = false,
      e.ultimaActualizacion = datetime()
  RETURN e
`;

/**
 * Eliminar un nodo EspacioDeportivo (hard delete)
 * Parámetros: { idCancha }
 */
export const DELETE_ESPACIO_DEPORTIVO = `
  MATCH (e:EspacioDeportivo {idCancha: $idCancha})
  DETACH DELETE e
`;

/**
 * Obtener todos los espacios deportivos activos
 */
export const GET_ESPACIOS_ACTIVOS = `
  MATCH (e:EspacioDeportivo)
  WHERE e.activo = true
  RETURN e
  ORDER BY e.ratingPromedio DESC
`;

/**
 * Obtener estadísticas de espacios deportivos
 */
export const GET_ESPACIO_STATS = `
  MATCH (e:EspacioDeportivo)
  RETURN 
    count(e) as totalEspacios,
    sum(CASE WHEN e.activo = true THEN 1 ELSE 0 END) as totalActivos,
    avg(e.precio) as precioPromedio,
    avg(e.ratingPromedio) as ratingPromedio
`;
