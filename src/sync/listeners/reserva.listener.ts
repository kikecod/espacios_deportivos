import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SyncService } from '../sync.service';

@Injectable()
export class ReservaListener {
  private readonly logger = new Logger(ReservaListener.name);

  constructor(private syncService: SyncService) {}

  /**
   * Escucha cuando una reserva es completada
   */
  @OnEvent('reserva.completada')
  async handleReservaCompletada(payload: {
    idReserva: number;
    idCliente: number;
    idCancha: number;
    montoTotal: number;
    completadaEn: Date;
  }) {
    try {
      this.logger.log(
        `📩 Evento recibido: Reserva ${payload.idReserva} completada`,
      );

      // 1. Verificar si el usuario existe en Neo4j
      const existe = await this.syncService.existePerfilUsuario(
        payload.idCliente,
      );

      // 2. Si no existe, crear perfil inicial
      if (!existe) {
        this.logger.log(
          `🆕 Usuario ${payload.idCliente} no existe en Neo4j, creando perfil...`,
        );
        await this.syncService.syncPerfilUsuario(payload.idCliente);
      }

      // 3. Verificar si la cancha existe en Neo4j, si no, crearla
      await this.syncService.syncEspacioDeportivo(payload.idCancha);

      // 4. Crear la relación RESERVO
      await this.syncService.crearRelacionReservo({
        idCliente: payload.idCliente,
        idCancha: payload.idCancha,
        montoTotal: payload.montoTotal,
        completadaEn: payload.completadaEn,
      });

      // 5. Actualizar el perfil del usuario (recalcular promedios)
      await this.syncService.syncPerfilUsuario(payload.idCliente);

      this.logger.log(
        `✅ Sincronización completada para reserva ${payload.idReserva}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error manejando reserva completada ${payload.idReserva}:`,
        error.message,
      );
      // No lanzamos el error para no romper el flujo principal
    }
  }
}
