/**
 * Queries Cypher para operaciones relacionadas con PerfilUsuario
 */

/**
 * Crear o actualizar un nodo PerfilUsuario
 * Parámetros: { idUsuario, precioPromedio, valoracionPromedio, disciplinasPreferidas, totalReservas, totalCalificaciones, ultimaActualizacion }
 */
export const CREATE_OR_UPDATE_PERFIL_USUARIO = `
  MERGE (p:PerfilUsuario {idUsuario: $idUsuario})
  SET p.precioPromedio = $precioPromedio,
      p.valoracionPromedio = $valoracionPromedio,
      p.disciplinasPreferidas = $disciplinasPreferidas,
      p.totalReservas = $totalReservas,
      p.totalCalificaciones = $totalCalificaciones,
      p.ultimaActualizacion = datetime($ultimaActualizacion)
  RETURN p
`;

/**
 * Crear un nodo PerfilUsuario
 * Parámetros: { idUsuario, precioPromedio, valoracionPromedio, disciplinasPreferidas, totalReservas, totalCalificaciones, ultimaActualizacion }
 */
export const CREATE_PERFIL_USUARIO = `
  CREATE (p:PerfilUsuario {
    idUsuario: $idUsuario,
    precioPromedio: $precioPromedio,
    valoracionPromedio: $valoracionPromedio,
    disciplinasPreferidas: $disciplinasPreferidas,
    totalReservas: $totalReservas,
    totalCalificaciones: $totalCalificaciones,
    ultimaActualizacion: datetime($ultimaActualizacion)
  })
  RETURN p
`;

/**
 * Actualizar propiedades de un nodo PerfilUsuario
 * Parámetros: { idUsuario, precioPromedio, valoracionPromedio, disciplinasPreferidas, totalReservas, totalCalificaciones, ultimaActualizacion }
 */
export const UPDATE_PERFIL_USUARIO = `
  MATCH (p:PerfilUsuario {idUsuario: $idUsuario})
  SET p.precioPromedio = $precioPromedio,
      p.valoracionPromedio = $valoracionPromedio,
      p.disciplinasPreferidas = $disciplinasPreferidas,
      p.totalReservas = $totalReservas,
      p.totalCalificaciones = $totalCalificaciones,
      p.ultimaActualizacion = datetime($ultimaActualizacion)
  RETURN p
`;

/**
 * Obtener perfil de usuario por ID
 * Parámetros: { idUsuario }
 */
export const GET_PERFIL_USUARIO = `
  MATCH (p:PerfilUsuario {idUsuario: $idUsuario})
  RETURN p
`;

/**
 * Verificar si existe un perfil de usuario
 * Parámetros: { idUsuario }
 */
export const EXISTS_PERFIL_USUARIO = `
  MATCH (p:PerfilUsuario {idUsuario: $idUsuario})
  RETURN count(p) > 0 as exists
`;

/**
 * Eliminar un nodo PerfilUsuario
 * Parámetros: { idUsuario }
 */
export const DELETE_PERFIL_USUARIO = `
  MATCH (p:PerfilUsuario {idUsuario: $idUsuario})
  DETACH DELETE p
`;

/**
 * Obtener estadísticas de perfiles de usuarios
 */
export const GET_PERFIL_STATS = `
  MATCH (p:PerfilUsuario)
  RETURN 
    count(p) as totalPerfiles,
    avg(p.totalReservas) as promedioReservas,
    avg(p.valoracionPromedio) as promedioValoracion
`;
