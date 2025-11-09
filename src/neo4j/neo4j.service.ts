import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session, Result } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  /**
   * Establece la conexión con Neo4j
   */
  async connect(): Promise<void> {
    try {
      const scheme = this.configService.get<string>('neo4j.scheme') || 'bolt';
      const host = this.configService.get<string>('neo4j.host') || 'localhost';
      const port = this.configService.get<number>('neo4j.port') || 7687;
      const username = this.configService.get<string>('neo4j.username') || 'neo4j';
      const password = this.configService.get<string>('neo4j.password');

      if (!password) {
        throw new Error('NEO4J_PASSWORD no está configurado en las variables de entorno');
      }

      const uri = `${scheme}://${host}:${port}`;

      this.driver = neo4j.driver(
        uri,
        neo4j.auth.basic(username, password),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 horas
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutos
        }
      );

      // Verificar conexión
      await this.driver.verifyConnectivity();
      this.logger.log(`✅ Conectado a Neo4j en ${uri}`);
    } catch (error) {
      this.logger.error('❌ Error al conectar con Neo4j:', error.message);
      throw error;
    }
  }

  /**
   * Cierra la conexión con Neo4j
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.logger.log('🔌 Conexión con Neo4j cerrada');
    }
  }

  /**
   * Obtiene una sesión de Neo4j
   */
  getSession(database?: string): Session {
    const db = database || this.configService.get<string>('neo4j.database');
    return this.driver.session({ database: db });
  }

  /**
   * Ejecuta una query Cypher y retorna el resultado completo
   */
  async runQuery(
    query: string,
    params: Record<string, any> = {},
    database?: string
  ): Promise<Result> {
    const session = this.getSession(database);
    
    try {
      this.logger.debug(`Ejecutando query: ${query.substring(0, 100)}...`);
      const result = await session.run(query, params);
      return result;
    } catch (error) {
      this.logger.error(`Error ejecutando query: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Ejecuta una query y retorna solo los records procesados
   */
  async run<T = any>(
    query: string,
    params: Record<string, any> = {},
    transform?: (record: any) => T
  ): Promise<T[]> {
    const result = await this.runQuery(query, params);
    
    if (transform) {
      return result.records.map(transform);
    }
    
    return result.records.map(record => record.toObject()) as T[];
  }

  /**
   * Ejecuta una query y retorna un solo resultado
   */
  async runSingle<T = any>(
    query: string,
    params: Record<string, any> = {},
    transform?: (record: any) => T
  ): Promise<T | null> {
    const results = await this.run<T>(query, params, transform);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Ejecuta múltiples queries en una transacción
   */
  async runTransaction(
    queries: Array<{ query: string; params?: Record<string, any> }>,
    database?: string
  ): Promise<void> {
    const session = this.getSession(database);
    const tx = session.beginTransaction();

    try {
      for (const { query, params } of queries) {
        await tx.run(query, params || {});
      }
      await tx.commit();
      this.logger.debug(`✅ Transacción completada con ${queries.length} queries`);
    } catch (error) {
      await tx.rollback();
      this.logger.error(`❌ Error en transacción, rollback ejecutado: ${error.message}`);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Verifica el estado de la conexión
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      await this.driver.verifyConnectivity();
      
      // Ejecutar query simple para verificar que la BD responde
      const result = await this.runSingle<{ status: string }>(
        'RETURN "OK" as status'
      );
      
      return {
        status: 'connected',
        message: `Neo4j está conectado y funcionando correctamente`
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Obtiene estadísticas de la base de datos
   */
  async getStats(): Promise<{
    totalNodes: number;
    totalRelationships: number;
    nodeLabels: string[];
  }> {
    try {
      // Contar nodos
      const nodesResult = await this.runSingle<{ count: number }>(
        'MATCH (n) RETURN count(n) as count'
      );

      // Contar relaciones
      const relsResult = await this.runSingle<{ count: number }>(
        'MATCH ()-[r]->() RETURN count(r) as count'
      );

      // Obtener labels
      const labelsResult = await this.run<{ label: string }>(
        'CALL db.labels() YIELD label RETURN label'
      );

      return {
        totalNodes: nodesResult?.count || 0,
        totalRelationships: relsResult?.count || 0,
        nodeLabels: labelsResult.map(r => r.label),
      };
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error.message}`);
      throw error;
    }
  }
}

