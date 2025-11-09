import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { CalificaCancha } from 'src/califica_cancha/entities/califica_cancha.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { PerfilUsuarioTransformer } from './transformers/perfil-usuario.transformer';
import { EspacioDeportivoTransformer } from './transformers/espacio-deportivo.transformer';
import * as UsuarioQueries from 'src/neo4j/queries/usuario.queries';
import * as CanchaQueries from 'src/neo4j/queries/cancha.queries';
import * as RecomendacionQueries from 'src/neo4j/queries/recomendacion.queries';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(CalificaCancha)
    private calificacionRepository: Repository<CalificaCancha>,
    @InjectRepository(Cancha)
    private canchaRepository: Repository<Cancha>,
    private neo4jService: Neo4jService,
    private perfilUsuarioTransformer: PerfilUsuarioTransformer,
    private espacioDeportivoTransformer: EspacioDeportivoTransformer,
  ) {}

  /**
   * Sincroniza o crea el perfil completo de un usuario en Neo4j
   */
  async syncPerfilUsuario(idCliente: number): Promise<void> {
    try {
      this.logger.debug(`🔄 Sincronizando perfil de usuario ${idCliente}...`);

      // Obtener todas las reservas completadas del cliente
      const reservas = await this.reservaRepository.find({
        where: {
          idCliente: idCliente,
          completadaEn: Not(IsNull()),
        },
        relations: ['cancha', 'cancha.parte', 'cancha.parte.disciplina'],
      });

      // Obtener todas las calificaciones del cliente
      const calificaciones = await this.calificacionRepository.find({
        where: { idCliente: idCliente },
      });

      const idUsuario = idCliente; // Usamos idCliente como idUsuario

      const perfilUsuario =
        this.perfilUsuarioTransformer.fromReservasYCalificaciones(
          idUsuario,
          reservas,
          calificaciones,
        );

      // Crear o actualizar el perfil en Neo4j
      await this.neo4jService.runQuery(
        UsuarioQueries.CREATE_OR_UPDATE_PERFIL_USUARIO,
        {
          ...perfilUsuario,
          ultimaActualizacion: perfilUsuario.ultimaActualizacion.toISOString(),
        },
      );

      this.logger.log(`✅ Perfil de usuario ${idCliente} sincronizado`);
    } catch (error) {
      this.logger.error(
        `❌ Error sincronizando perfil de usuario ${idCliente}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Sincroniza o crea un espacio deportivo en Neo4j
   */
  async syncEspacioDeportivo(idCancha: number): Promise<void> {
    try {
      this.logger.debug(`🔄 Sincronizando cancha ${idCancha}...`);

      const cancha = await this.canchaRepository.findOne({
        where: { idCancha },
        relations: ['parte', 'parte.disciplina'],
      });

      if (!cancha) {
        this.logger.warn(`⚠️ Cancha ${idCancha} no encontrada`);
        return;
      }

      if (!this.espacioDeportivoTransformer.isValid(cancha)) {
        this.logger.warn(`⚠️ Cancha ${idCancha} no tiene datos válidos`);
        return;
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

      this.logger.log(`✅ Cancha ${idCancha} sincronizada`);
    } catch (error) {
      this.logger.error(
        `❌ Error sincronizando cancha ${idCancha}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Crea una relación RESERVO en Neo4j
   */
  async crearRelacionReservo(payload: {
    idCliente: number;
    idCancha: number;
    montoTotal: number;
    completadaEn: Date;
  }): Promise<void> {
    try {
      const idUsuario = payload.idCliente;

      await this.neo4jService.runQuery(
        RecomendacionQueries.CREATE_RELACION_RESERVO,
        {
          idUsuario,
          idCancha: payload.idCancha,
          fecha: payload.completadaEn.toISOString(),
          precioReserva: parseFloat(payload.montoTotal.toString()),
          completada: true,
        },
      );

      this.logger.log(
        `✅ Relación RESERVO creada: Usuario ${idUsuario} → Cancha ${payload.idCancha}`,
      );
    } catch (error) {
      this.logger.error('❌ Error creando relación RESERVO:', error.message);
      throw error;
    }
  }

  /**
   * Crea una relación CALIFICO en Neo4j
   */
  async crearRelacionCalificacion(payload: {
    idCliente: number;
    idCancha: number;
    puntaje: number;
    comentario: string;
    creadaEn: Date;
  }): Promise<void> {
    try {
      const idUsuario = payload.idCliente;

      await this.neo4jService.runQuery(
        RecomendacionQueries.CREATE_RELACION_CALIFICO,
        {
          idUsuario,
          idCancha: payload.idCancha,
          rating: payload.puntaje,
          fecha: payload.creadaEn.toISOString(),
          comentario: payload.comentario || '',
        },
      );

      this.logger.log(
        `✅ Relación CALIFICO creada: Usuario ${idUsuario} → Cancha ${payload.idCancha}`,
      );
    } catch (error) {
      this.logger.error('❌ Error creando relación CALIFICO:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si un perfil de usuario existe en Neo4j
   */
  async existePerfilUsuario(idCliente: number): Promise<boolean> {
    try {
      const result = await this.neo4jService.runSingle<{ exists: boolean }>(
        UsuarioQueries.EXISTS_PERFIL_USUARIO,
        { idUsuario: idCliente },
        (record) => ({ exists: record.get('exists') }),
      );

      return result?.exists || false;
    } catch (error) {
      this.logger.error(
        `❌ Error verificando perfil de usuario ${idCliente}:`,
        error.message,
      );
      return false;
    }
  }

  /**
   * Marca una cancha como inactiva en Neo4j
   */
  async marcarCanchaInactiva(idCancha: number): Promise<void> {
    try {
      await this.neo4jService.runQuery(CanchaQueries.SET_INACTIVO, {
        idCancha,
      });

      this.logger.log(`✅ Cancha ${idCancha} marcada como inactiva en Neo4j`);
    } catch (error) {
      this.logger.error(
        `❌ Error marcando cancha ${idCancha} como inactiva:`,
        error.message,
      );
    }
  }
}
