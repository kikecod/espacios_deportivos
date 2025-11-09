import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SyncService } from '../sync.service';

@Injectable()
export class CalificacionListener {
  private readonly logger = new Logger(CalificacionListener.name);

  constructor(private syncService: SyncService) {}

  /**
   * Escucha cuando se crea una nueva calificación
   */
  @OnEvent('calificacion.creada')
  async handleCalificacionCreada(payload: {
    idCliente: number;
    idCancha: number;
    puntaje: number;
    comentario: string;
    creadaEn: Date;
  }) {
    try {
      this.logger.log(
        `📩 Evento recibido: Nueva calificación Cliente ${payload.idCliente} → Cancha ${payload.idCancha}`,
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

      // 3. Crear la relación CALIFICO
      await this.syncService.crearRelacionCalificacion({
        idCliente: payload.idCliente,
        idCancha: payload.idCancha,
        puntaje: payload.puntaje,
        comentario: payload.comentario,
        creadaEn: payload.creadaEn,
      });

      // 4. Actualizar el perfil del usuario (recalcular valoración promedio)
      await this.syncService.syncPerfilUsuario(payload.idCliente);

      // 5. Actualizar la cancha (el rating promedio puede haber cambiado)
      await this.syncService.syncEspacioDeportivo(payload.idCancha);

      this.logger.log(
        `✅ Sincronización completada para calificación Cliente ${payload.idCliente} → Cancha ${payload.idCancha}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error manejando calificación creada:`,
        error.message,
      );
      // No lanzamos el error para no romper el flujo principal
    }
  }
}
