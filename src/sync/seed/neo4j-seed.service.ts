import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { CalificaCancha } from 'src/califica_cancha/entities/califica_cancha.entity';
import { PerfilUsuarioTransformer } from '../transformers/perfil-usuario.transformer';
import { EspacioDeportivoTransformer } from '../transformers/espacio-deportivo.transformer';
import * as UsuarioQueries from 'src/neo4j/queries/usuario.queries';
import * as CanchaQueries from 'src/neo4j/queries/cancha.queries';
import * as RecomendacionQueries from 'src/neo4j/queries/recomendacion.queries';

@Injectable()
export class Neo4jSeedService {
  private readonly logger = new Logger(Neo4jSeedService.name);

  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(CalificaCancha)
    private calificacionRepository: Repository<CalificaCancha>,
    private neo4jService: Neo4jService,
    private perfilUsuarioTransformer: PerfilUsuarioTransformer,
    private espacioDeportivoTransformer: EspacioDeportivoTransformer,
  ) {}

  /**
   * Ejecuta la migración completa de datos de PostgreSQL a Neo4j
   */
  async ejecutarMigracionCompleta(): Promise<{
    success: boolean;
    stats: any;
    errors: string[];
  }> {
    this.logger.log('🚀 Iniciando migración completa a Neo4j...');
    const errors: string[] = [];
    const stats = {
      usuariosMigrados: 0,
      canchasMigradas: 0,
      relacionesReservo: 0,
      relacionesCalificacion: 0,
      tiempoTotal: 0,
    };

    const startTime = Date.now();

    try {
      // 1. Limpiar Neo4j (opcional, solo para re-seed)
      await this.limpiarNeo4j();

      // 2. Migrar Canchas
      this.logger.log('📍 Migrando canchas...');
      stats.canchasMigradas = await this.migrarCanchas();

      // 3. Migrar Usuarios (Clientes con reservas)
      this.logger.log('👥 Migrando perfiles de usuarios...');
      stats.usuariosMigrados = await this.migrarUsuarios();

      // 4. Migrar Relaciones de Reservas
      this.logger.log('🔗 Migrando relaciones de reservas...');
      stats.relacionesReservo = await this.migrarRelacionesReservas();

      // 5. Migrar Relaciones de Calificaciones
      this.logger.log('⭐ Migrando relaciones de calificaciones...');
      stats.relacionesCalificacion = await this.migrarRelacionesCalificaciones();

      stats.tiempoTotal = Date.now() - startTime;

      this.logger.log('✅ Migración completada exitosamente');
      this.logger.log(`📊 Estadísticas: ${JSON.stringify(stats, null, 2)}`);

      return {
        success: true,
        stats,
        errors,
      };
    } catch (error) {
      this.logger.error('❌ Error durante la migración:', error);
      errors.push(error.message);
      return {
        success: false,
        stats,
        errors,
      };
    }
  }

  /**
   * Limpia todos los datos de Neo4j
   */
  private async limpiarNeo4j(): Promise<void> {
    this.logger.warn('🗑️  Limpiando base de datos Neo4j...');
    await this.neo4jService.runQuery('MATCH (n) DETACH DELETE n');
    this.logger.log('✅ Neo4j limpiado');
  }

  /**
   * Migra todas las canchas activas
   */
  private async migrarCanchas(): Promise<number> {
    const canchas = await this.canchaRepository.find({
      relations: ['parte', 'parte.disciplina'],
      where: { eliminadoEn: IsNull() },
    });

    let migradas = 0;

    for (const cancha of canchas) {
      try {
        if (!this.espacioDeportivoTransformer.isValid(cancha)) {
          this.logger.warn(
            `⚠️  Cancha ${cancha.idCancha} no tiene datos válidos, omitida`,
          );
          continue;
        }

        const espacioDeportivo =
          this.espacioDeportivoTransformer.fromCancha(cancha);

        await this.neo4jService.runQuery(
          CanchaQueries.CREATE_OR_UPDATE_ESPACIO_DEPORTIVO,
          {
            ...espacioDeportivo,
            ultimaActualizacion: espacioDeportivo.ultimaActualizacion.toISOString(),
          },
        );

        migradas++;
      } catch (error) {
        this.logger.error(
          `❌ Error migrando cancha ${cancha.idCancha}:`,
          error.message,
        );
      }
    }

    this.logger.log(`✅ ${migradas} canchas migradas`);
    return migradas;
  }

  /**
   * Migra usuarios (clientes) con al menos una reserva
   */
  private async migrarUsuarios(): Promise<number> {
    // Obtener todas las reservas completadas con sus clientes
    const reservasCompletadas = await this.reservaRepository.find({
      where: {
        completadaEn: Not(IsNull()),
      },
      relations: ['cliente'],
    });

    // Obtener IDs únicos de clientes que tienen reservas completadas
    const clienteIds = [...new Set(reservasCompletadas.map((r) => r.idCliente))];

    this.logger.log(`📊 Encontrados ${clienteIds.length} clientes con reservas completadas`);

    let migrados = 0;

    for (const idCliente of clienteIds) {
      try {
        // Obtener reservas completadas del cliente
        const reservas = await this.reservaRepository.find({
          where: {
            idCliente: idCliente,
            completadaEn: Not(IsNull()),
          },
          relations: ['cancha', 'cancha.parte', 'cancha.parte.disciplina'],
        });

        // Obtener calificaciones del cliente
        const calificaciones = await this.calificacionRepository.find({
          where: { idCliente: idCliente },
        });

        // Usar idCliente como idUsuario
        const idUsuario = idCliente;

        const perfilUsuario =
          this.perfilUsuarioTransformer.fromReservasYCalificaciones(
            idUsuario,
            reservas,
            calificaciones,
          );

        await this.neo4jService.runQuery(
          UsuarioQueries.CREATE_OR_UPDATE_PERFIL_USUARIO,
          {
            ...perfilUsuario,
            ultimaActualizacion: perfilUsuario.ultimaActualizacion.toISOString(),
          },
        );

        migrados++;

        // Mostrar progreso cada 10 usuarios
        if (migrados % 10 === 0) {
          this.logger.log(`📈 Progreso: ${migrados}/${clienteIds.length} usuarios migrados`);
        }
      } catch (error) {
        this.logger.error(
          `❌ Error migrando usuario ${idCliente}:`,
          error.message,
        );
      }
    }

    this.logger.log(`✅ ${migrados} perfiles de usuario migrados`);
    return migrados;
  }

  /**
   * Migra relaciones RESERVO
   */
  private async migrarRelacionesReservas(): Promise<number> {
    const reservas = await this.reservaRepository.find({
      where: { completadaEn: Not(IsNull()) },
      relations: ['cliente', 'cancha'],
    });

    let relacionesCreadas = 0;

    for (const reserva of reservas) {
      try {
        const idUsuario = reserva.idCliente; // Ajustar según tu lógica

        await this.neo4jService.runQuery(
          RecomendacionQueries.CREATE_RELACION_RESERVO,
          {
            idUsuario,
            idCancha: reserva.idCancha,
            fecha: reserva.completadaEn?.toISOString() || new Date().toISOString(),
            precioReserva: parseFloat(reserva.montoTotal.toString()),
            completada: true,
          },
        );

        relacionesCreadas++;
      } catch (error) {
        this.logger.error(
          `❌ Error creando relación RESERVO para reserva ${reserva.idReserva}:`,
          error.message,
        );
      }
    }

    this.logger.log(`✅ ${relacionesCreadas} relaciones RESERVO creadas`);
    return relacionesCreadas;
  }

  /**
   * Migra relaciones CALIFICO
   */
  private async migrarRelacionesCalificaciones(): Promise<number> {
    const calificaciones = await this.calificacionRepository.find({
      where: { estado: 'ACTIVA' },
    });

    let relacionesCreadas = 0;

    for (const calif of calificaciones) {
      try {
        const idUsuario = calif.idCliente; // Ajustar según tu lógica

        await this.neo4jService.runQuery(
          RecomendacionQueries.CREATE_RELACION_CALIFICO,
          {
            idUsuario,
            idCancha: calif.idCancha,
            rating: calif.puntaje,
            fecha: calif.creadaEn.toISOString(),
            comentario: calif.comentario || '',
          },
        );

        relacionesCreadas++;
      } catch (error) {
        this.logger.error(
          `❌ Error creando relación CALIFICO para ${calif.idCliente}-${calif.idCancha}:`,
          error.message,
        );
      }
    }

    this.logger.log(`✅ ${relacionesCreadas} relaciones CALIFICO creadas`);
    return relacionesCreadas;
  }

  /**
   * Obtiene estadísticas de la migración
   */
  async obtenerEstadisticas(): Promise<any> {
    const stats = await this.neo4jService.getStats();
    return stats;
  }
}
