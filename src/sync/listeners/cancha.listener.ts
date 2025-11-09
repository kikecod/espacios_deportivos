import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SyncService } from '../sync.service';

@Injectable()
export class CanchaListener {
  private readonly logger = new Logger(CanchaListener.name);

  constructor(private syncService: SyncService) {}

  /**
   * Escucha cuando se crea una nueva cancha
   */
  @OnEvent('cancha.creada')
  async handleCanchaCreada(payload: { idCancha: number }) {
    try {
      this.logger.log(`📩 Evento recibido: Nueva cancha ${payload.idCancha} creada`);

      // Sincronizar la nueva cancha con Neo4j
      await this.syncService.syncEspacioDeportivo(payload.idCancha);

      this.logger.log(`✅ Cancha ${payload.idCancha} creada en Neo4j`);
    } catch (error) {
      this.logger.error(
        `❌ Error sincronizando nueva cancha ${payload.idCancha}:`,
        error.message,
      );
    }
  }

  /**
   * Escucha cuando se actualiza una cancha
   */
  @OnEvent('cancha.actualizada')
  async handleCanchaActualizada(payload: { idCancha: number }) {
    try {
      this.logger.log(`📩 Evento recibido: Cancha ${payload.idCancha} actualizada`);

      // Sincronizar la cancha con Neo4j
      await this.syncService.syncEspacioDeportivo(payload.idCancha);

      this.logger.log(`✅ Cancha ${payload.idCancha} sincronizada en Neo4j`);
    } catch (error) {
      this.logger.error(
        `❌ Error manejando actualización de cancha ${payload.idCancha}:`,
        error.message,
      );
    }
  }

  /**
   * Escucha cuando se elimina una cancha (soft delete)
   */
  @OnEvent('cancha.eliminada')
  async handleCanchaEliminada(payload: { idCancha: number }) {
    try {
      this.logger.log(`📩 Evento recibido: Cancha ${payload.idCancha} eliminada`);

      // Marcar como inactiva en Neo4j
      await this.syncService.marcarCanchaInactiva(payload.idCancha);

      this.logger.log(`✅ Cancha ${payload.idCancha} marcada como inactiva en Neo4j`);
    } catch (error) {
      this.logger.error(
        `❌ Error manejando eliminación de cancha ${payload.idCancha}:`,
        error.message,
      );
    }
  }
}
