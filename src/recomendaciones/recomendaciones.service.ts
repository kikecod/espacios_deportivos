import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { EspacioRecomendadoDto, RecomendacionesResponseDto } from './dto';
import { int } from 'neo4j-driver';

@Injectable()
export class RecomendacionesService {
  private readonly logger = new Logger(RecomendacionesService.name);

  // Pesos para el algoritmo de similitud
  private readonly ALPHA = 0.6; // Peso para similitud de coseno (numéricos)
  private readonly BETA = 0.4; // Peso para similitud de Jaccard (categóricos)

  constructor(private neo4jService: Neo4jService) {}

  /**
   * Obtener recomendaciones personalizadas para un usuario
   * basadas en su historial de reservas
   */
  async obtenerRecomendacionesPersonalizadas(
    idUsuario: number,
    limite: number = 10,
  ): Promise<RecomendacionesResponseDto> {
    this.logger.log(
      `🎯 Generando recomendaciones personalizadas para usuario ${idUsuario}`,
    );

    // 1. Verificar si el usuario existe y tiene historial
    const existeUsuario = await this.verificarUsuarioExiste(idUsuario);
    if (!existeUsuario) {
      throw new NotFoundException(
        `Usuario ${idUsuario} no encontrado en el sistema de recomendaciones`,
      );
    }

    const tieneHistorial = await this.verificarHistorialUsuario(idUsuario);

    // 2. Si no tiene historial, devolver canchas populares
    if (!tieneHistorial) {
      this.logger.log(
        `ℹ️ Usuario ${idUsuario} no tiene historial, mostrando populares`,
      );
      return this.obtenerCanchasPopulares(limite);
    }

    // 3. Obtener perfil del usuario
    const perfilUsuario = await this.obtenerPerfilUsuario(idUsuario);
    this.logger.debug(`📊 Perfil del usuario:`, JSON.stringify(perfilUsuario, null, 2));

    // 4. Obtener canchas candidatas (que no ha reservado)
    const candidatas = await this.obtenerCanchasCandidatas(idUsuario, Math.floor(limite * 3));
    this.logger.debug(`🏟️ Canchas candidatas encontradas: ${candidatas.length}`);

    // Si no hay candidatas, retornar array vacío con mensaje
    if (candidatas.length === 0) {
      this.logger.warn(`⚠️ No hay canchas nuevas para recomendar al usuario ${idUsuario}`);
      return {
        total: 0,
        recomendaciones: [],
        metodo: 'content-based',
        mensaje: `No hay nuevas canchas para recomendar. Ya has visitado todas las opciones disponibles.`,
      };
    }

    // 5. Calcular similitud para cada candidata
    const recomendaciones = candidatas.map((cancha) => {
      const score = this.calcularSimilitud(perfilUsuario, cancha);
      this.logger.debug(`  - ${cancha.nombre}: score ${score.toFixed(3)}`);
      return {
        ...this.mapearEspacioDeportivo(cancha),
        score,
        razonRecomendacion: this.generarRazonRecomendacion(perfilUsuario, cancha),
      };
    });

    // 6. Ordenar por score y limitar resultados
    const topRecomendaciones = recomendaciones
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);

    return {
      total: topRecomendaciones.length,
      recomendaciones: topRecomendaciones,
      metodo: 'content-based',
      mensaje: `Recomendaciones basadas en tus ${perfilUsuario.cantidadReservas} reservas anteriores`,
    };
  }

  /**
   * Obtener canchas similares a una específica
   */
  async obtenerCanchasSimilares(
    idCancha: number,
    limite: number = 10,
  ): Promise<RecomendacionesResponseDto> {
    this.logger.log(`🔍 Buscando canchas similares a ${idCancha}`);

    // 1. Verificar que la cancha existe
    const canchaReferencia = await this.obtenerCancha(idCancha);
    if (!canchaReferencia) {
      throw new NotFoundException(`Cancha ${idCancha} no encontrada`);
    }

    // 2. Obtener todas las canchas activas excepto la de referencia
    const query = `
      MATCH (e1:EspacioDeportivo {idCancha: $idCancha})
      MATCH (e2:EspacioDeportivo)
      WHERE e2.idCancha <> $idCancha AND (e2.activa = true OR e2.activa IS NULL)
      RETURN e2
      LIMIT $limite
    `;

    const resultado = await this.neo4jService.runQuery(query, {
      idCancha,
      limite: int(Math.floor(limite * 2)), // Convertir a Integer de Neo4j
    });

    const todasCanchas = resultado.records.map((r) => r.get('e2').properties);

    // 3. Calcular similitud con la cancha de referencia
    const similares = todasCanchas.map((cancha) => {
      const score = this.calcularSimilitudEntreCanchas(canchaReferencia, cancha);
      return {
        ...this.mapearEspacioDeportivo(cancha),
        score,
        razonRecomendacion: this.generarRazonSimilitud(canchaReferencia, cancha),
      };
    });

    // 4. Ordenar y limitar
    const topSimilares = similares
      .sort((a, b) => b.score - a.score)
      .slice(0, limite);

    return {
      total: topSimilares.length,
      recomendaciones: topSimilares,
      metodo: 'similar',
      mensaje: `Canchas similares a ${canchaReferencia.nombre}`,
    };
  }

  /**
   * Obtener canchas populares (para usuarios sin historial)
   */
  async obtenerCanchasPopulares(
    limite: number = 10,
  ): Promise<RecomendacionesResponseDto> {
    this.logger.log(`📊 Obteniendo canchas populares`);

    const query = `
      MATCH (e:EspacioDeportivo)
      WHERE (e.activa = true OR e.activa IS NULL)
      OPTIONAL MATCH (e)<-[r:RESERVO]-()
      WITH e, count(r) as totalReservas
      RETURN e, totalReservas
      ORDER BY e.ratingPromedio DESC, totalReservas DESC
      LIMIT $limite
    `;

    const resultado = await this.neo4jService.runQuery(query, { 
      limite: int(Math.floor(limite)) // Convertir a Integer de Neo4j
    });

    const populares = resultado.records.map((r) => {
      const cancha = r.get('e').properties;
      const totalReservas = this.toNumber(r.get('totalReservas'));

      return {
        ...this.mapearEspacioDeportivo(cancha),
        score: this.calcularScorePopularidad(
          this.toNumber(cancha.ratingPromedio), 
          totalReservas
        ),
        razonRecomendacion: `⭐ ${this.toNumber(cancha.ratingPromedio).toFixed(1)} estrellas | ${totalReservas} reservas`,
      };
    });

    return {
      total: populares.length,
      recomendaciones: populares,
      metodo: 'popular',
      mensaje: 'Canchas más populares y mejor valoradas',
    };
  }

  /**
   * Explorar nuevas opciones (canchas que el usuario no ha visitado)
   */
  async explorarNuevasOpciones(
    idUsuario: number,
    disciplina?: string,
    limite: number = 10,
  ): Promise<RecomendacionesResponseDto> {
    this.logger.log(
      `🆕 Explorando nuevas opciones para usuario ${idUsuario}`,
    );

    const existeUsuario = await this.verificarUsuarioExiste(idUsuario);
    if (!existeUsuario) {
      throw new NotFoundException(`Usuario ${idUsuario} no encontrado`);
    }

    const query = `
      MATCH (u:PerfilUsuario {idUsuario: $idUsuario})
      OPTIONAL MATCH (u)-[:RESERVO]->(reservadas:EspacioDeportivo)
      WITH u, collect(DISTINCT reservadas.idCancha) as idsReservadas
      MATCH (e:EspacioDeportivo)
      WHERE (e.activa = true OR e.activa IS NULL)
        AND NOT e.idCancha IN idsReservadas
        ${disciplina ? 'AND $disciplina IN e.disciplinas' : ''}
      OPTIONAL MATCH (e)<-[r:RESERVO]-()
      WITH e, count(r) as totalReservas
      RETURN e, totalReservas
      ORDER BY e.ratingPromedio DESC, totalReservas DESC
      LIMIT $limite
    `;

    const resultado = await this.neo4jService.runQuery(query, {
      idUsuario,
      disciplina,
      limite: int(Math.floor(limite)), // Convertir a Integer de Neo4j
    });

    const nuevasOpciones = resultado.records.map((r) => {
      const cancha = r.get('e').properties;
      const totalReservas = this.toNumber(r.get('totalReservas'));

      return {
        ...this.mapearEspacioDeportivo(cancha),
        score: this.calcularScorePopularidad(
          this.toNumber(cancha.ratingPromedio), 
          totalReservas
        ),
        razonRecomendacion: `🆕 Nueva opción - ⭐ ${this.toNumber(cancha.ratingPromedio).toFixed(1)}`,
      };
    });

    return {
      total: nuevasOpciones.length,
      recomendaciones: nuevasOpciones,
      metodo: 'popular',
      mensaje: disciplina
        ? `Nuevas opciones de ${disciplina}`
        : 'Nuevas opciones para explorar',
    };
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  /**
   * Helper para convertir valores de Neo4j a números normales de JavaScript
   * Maneja tanto valores Integer de Neo4j como valores JavaScript normales
   */
  private toNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (value.toNumber) return value.toNumber();
    if (value.low !== undefined) return value.low;
    return Number(value) || 0;
  }

  private async verificarUsuarioExiste(idUsuario: number): Promise<boolean> {
    const query = `
      MATCH (u:PerfilUsuario {idUsuario: $idUsuario})
      RETURN count(u) > 0 as existe
    `;
    const resultado = await this.neo4jService.runQuery(query, { idUsuario });
    return resultado.records[0]?.get('existe') || false;
  }

  private async verificarHistorialUsuario(idUsuario: number): Promise<boolean> {
    const query = `
      MATCH (u:PerfilUsuario {idUsuario: $idUsuario})-[r:RESERVO]->()
      RETURN count(r) > 0 as tieneHistorial
    `;
    const resultado = await this.neo4jService.runQuery(query, { idUsuario });
    return resultado.records[0]?.get('tieneHistorial') || false;
  }

  private async obtenerPerfilUsuario(idUsuario: number): Promise<any> {
    const query = `
      MATCH (u:PerfilUsuario {idUsuario: $idUsuario})
      OPTIONAL MATCH (u)-[r:RESERVO]->(e:EspacioDeportivo)
      WITH u, 
           avg(r.precioReserva) as precioPromedio,
           collect(DISTINCT e.disciplinas) as disciplinasAnidadas,
           count(r) as totalReservas
      RETURN u.idUsuario as idUsuario,
             u.nombre as nombre,
             u.cantidadReservas as cantidadReservas,
             precioPromedio,
             totalReservas,
             [d IN disciplinasAnidadas | d] as todasDisciplinas
    `;

    const resultado = await this.neo4jService.runQuery(query, { idUsuario });
    
    if (resultado.records.length === 0) {
      return null;
    }
    
    const record = resultado.records[0];

    // Aplanar disciplinas
    const disciplinasAnidadas = record.get('todasDisciplinas') || [];
    const disciplinasUnicas = [...new Set(disciplinasAnidadas.flat())];

    return {
      idUsuario: this.toNumber(record.get('idUsuario')),
      nombre: record.get('nombre'),
      cantidadReservas: this.toNumber(record.get('totalReservas')) || this.toNumber(record.get('cantidadReservas')),
      precioPromedio: this.toNumber(record.get('precioPromedio')),
      disciplinasPreferidas: disciplinasUnicas,
    };
  }

  private async obtenerCanchasCandidatas(
    idUsuario: number,
    limite: number,
  ): Promise<any[]> {
    // Primero ver cuántas canchas ha reservado
    const reservadasQuery = `
      MATCH (u:PerfilUsuario {idUsuario: $idUsuario})-[:RESERVO]->(reservadas:EspacioDeportivo)
      RETURN collect(DISTINCT reservadas.idCancha) as idsReservadas, count(DISTINCT reservadas) as total
    `;
    
    const reservadasResult = await this.neo4jService.runQuery(reservadasQuery, { idUsuario });
    const idsReservadas = reservadasResult.records[0]?.get('idsReservadas') || [];
    const totalReservadas = this.toNumber(reservadasResult.records[0]?.get('total'));
    
    this.logger.debug(`🔍 Usuario ${idUsuario} ha reservado ${totalReservadas} canchas diferentes: [${idsReservadas.map(id => this.toNumber(id)).join(', ')}]`);
    
    // Ver cuántas canchas activas hay en total
    const totalActivasQuery = `
      MATCH (e:EspacioDeportivo)
      WHERE (e.activa = true OR e.activa IS NULL)
      RETURN count(e) as total
    `;
    
    const totalActivasResult = await this.neo4jService.runQuery(totalActivasQuery, {});
    const totalActivas = this.toNumber(totalActivasResult.records[0]?.get('total'));
    this.logger.debug(`📍 Total de canchas activas en el sistema: ${totalActivas}`);
    
    // Luego buscar candidatas
    const query = `
      MATCH (e:EspacioDeportivo)
      WHERE (e.activa = true OR e.activa IS NULL)
      WITH e, $idsReservadas as reservadas
      WHERE NOT e.idCancha IN reservadas
      RETURN e
      LIMIT $limite
    `;

    const resultado = await this.neo4jService.runQuery(query, {
      idsReservadas,
      limite: int(Math.floor(limite)), // Convertir a Integer de Neo4j
    });
    
    const candidatas = resultado.records.map((r) => r.get('e').properties);
    
    this.logger.debug(`✅ Encontradas ${candidatas.length} canchas candidatas (no reservadas por el usuario)`);
    
    return candidatas;
  }

  private async obtenerCancha(idCancha: number): Promise<any> {
    const query = `
      MATCH (e:EspacioDeportivo {idCancha: $idCancha})
      RETURN e
    `;

    const resultado = await this.neo4jService.runQuery(query, { idCancha });
    const cancha = resultado.records[0]?.get('e')?.properties;
    
    // Si la cancha existe pero está inactiva, retornar null
    if (cancha && cancha.activa === false) {
      return null;
    }
    
    return cancha;
  }

  /**
   * Calcular similitud entre perfil de usuario y una cancha
   * Score = α × SimCoseno + β × SimJaccard
   */
  private calcularSimilitud(perfil: any, cancha: any): number {
    // 1. Similitud de Coseno (atributos numéricos: precio)
    const simCoseno = this.similitudCoseno(
      [perfil.precioPromedio || 0],
      [cancha.precioPorHora || 0],
    );

    // 2. Similitud de Jaccard (disciplinas)
    const simJaccard = this.similitudJaccard(
      perfil.disciplinasPreferidas || [],
      cancha.disciplinas || [],
    );

    // 3. Combinar con pesos
    const score = this.ALPHA * simCoseno + this.BETA * simJaccard;

    return parseFloat(score.toFixed(3));
  }

  /**
   * Calcular similitud entre dos canchas
   */
  private calcularSimilitudEntreCanchas(cancha1: any, cancha2: any): number {
    // 1. Similitud de Coseno (precio y rating)
    const simCoseno = this.similitudCoseno(
      [cancha1.precioPorHora || 0, cancha1.ratingPromedio || 0],
      [cancha2.precioPorHora || 0, cancha2.ratingPromedio || 0],
    );

    // 2. Similitud de Jaccard (disciplinas)
    const simJaccard = this.similitudJaccard(
      cancha1.disciplinas || [],
      cancha2.disciplinas || [],
    );

    // 3. Combinar
    const score = this.ALPHA * simCoseno + this.BETA * simJaccard;

    return parseFloat(score.toFixed(3));
  }

  /**
   * Similitud del Coseno para vectores numéricos
   */
  private similitudCoseno(vector1: number[], vector2: number[]): number {
    if (vector1.length === 0 || vector2.length === 0) return 0;

    const producto = vector1.reduce((sum, v1, i) => sum + v1 * vector2[i], 0);
    const magnitud1 = Math.sqrt(
      vector1.reduce((sum, v) => sum + v * v, 0),
    );
    const magnitud2 = Math.sqrt(
      vector2.reduce((sum, v) => sum + v * v, 0),
    );

    if (magnitud1 === 0 || magnitud2 === 0) return 0;

    return producto / (magnitud1 * magnitud2);
  }

  /**
   * Similitud de Jaccard para conjuntos (disciplinas)
   */
  private similitudJaccard(set1: string[], set2: string[]): number {
    if (set1.length === 0 && set2.length === 0) return 1;
    if (set1.length === 0 || set2.length === 0) return 0;

    const interseccion = set1.filter((item) => set2.includes(item)).length;
    const union = new Set([...set1, ...set2]).size;

    return interseccion / union;
  }

  /**
   * Calcular score de popularidad
   */
  private calcularScorePopularidad(rating: number, totalReservas: number): number {
    // Normalizar rating (0-5) a (0-1)
    const ratingNorm = rating / 5;

    // Normalizar reservas (logaritmo para suavizar)
    const reservasNorm = Math.min(Math.log10(totalReservas + 1) / 3, 1);

    // Combinar (70% rating, 30% popularidad)
    const score = 0.7 * ratingNorm + 0.3 * reservasNorm;

    return parseFloat(score.toFixed(3));
  }

  /**
   * Generar razón de recomendación personalizada
   */
  private generarRazonRecomendacion(perfil: any, cancha: any): string {
    const razones: string[] = [];

    // Coincidencia de disciplinas
    const disciplinasComunes = perfil.disciplinasPreferidas.filter((d) =>
      cancha.disciplinas.includes(d),
    );
    if (disciplinasComunes.length > 0) {
      razones.push(`✅ ${disciplinasComunes.join(', ')}`);
    }

    // Precio similar
    const difPrecio = Math.abs(perfil.precioPromedio - cancha.precioPorHora);
    if (difPrecio < 10) {
      razones.push(`💰 Precio similar a tus reservas`);
    }

    // Rating
    if (cancha.ratingPromedio >= 4) {
      razones.push(`⭐ ${cancha.ratingPromedio.toFixed(1)} estrellas`);
    }

    return razones.join(' • ') || 'Nueva opción para ti';
  }

  /**
   * Generar razón de similitud entre canchas
   */
  private generarRazonSimilitud(cancha1: any, cancha2: any): string {
    const razones: string[] = [];

    // Disciplinas en común
    const disciplinasComunes = cancha1.disciplinas.filter((d) =>
      cancha2.disciplinas.includes(d),
    );
    if (disciplinasComunes.length > 0) {
      razones.push(`${disciplinasComunes.join(', ')}`);
    }

    // Precio similar
    const difPrecio = Math.abs(cancha1.precioPorHora - cancha2.precioPorHora);
    if (difPrecio < 15) {
      razones.push(`Precio similar ($${cancha2.precioPorHora}/h)`);
    }

    return razones.join(' • ') || 'Similar';
  }

  /**
   * Mapear entidad Neo4j a DTO
   */
  private mapearEspacioDeportivo(cancha: any): Omit<EspacioRecomendadoDto, 'score' | 'razonRecomendacion' | 'basadoEn'> {
    return {
      idCancha: this.toNumber(cancha.idCancha),
      nombre: cancha.nombre || '',
      ubicacion: cancha.ubicacion || '',
      precioPorHora: this.toNumber(cancha.precioPorHora),
      disciplinas: cancha.disciplinas || [],
      ratingPromedio: this.toNumber(cancha.ratingPromedio),
      cantidadResenas: this.toNumber(cancha.cantidadResenas),
      activa: cancha.activa !== false,
    };
  }
}
