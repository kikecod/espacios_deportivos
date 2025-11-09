import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SyncService } from '../sync.service';

interface ParteEvent {
  idCancha: number;
  idDisciplina: number;
}

@Injectable()
export class ParteListener {
  private readonly logger = new Logger(ParteListener.name);

  constructor(private readonly syncService: SyncService) {}

  @OnEvent('parte.creada')
  async handleParteCreada(event: ParteEvent) {
    this.logger.log(`Parte creada: Cancha ${event.idCancha} - Disciplina ${event.idDisciplina}`);
    try {
      // Re-sincronizar la cancha completa para actualizar sus disciplinas en Neo4j
      await this.syncService.syncEspacioDeportivo(event.idCancha);
      this.logger.log(`Cancha ${event.idCancha} sincronizada con nueva disciplina`);
    } catch (error) {
      this.logger.error(`Error sincronizando cancha ${event.idCancha}:`, error);
    }
  }

  @OnEvent('parte.actualizada')
  async handleParteActualizada(event: ParteEvent) {
    this.logger.log(`Parte actualizada: Cancha ${event.idCancha} - Disciplina ${event.idDisciplina}`);
    try {
      // Re-sincronizar la cancha completa para actualizar sus disciplinas en Neo4j
      await this.syncService.syncEspacioDeportivo(event.idCancha);
      this.logger.log(`Cancha ${event.idCancha} re-sincronizada tras actualización`);
    } catch (error) {
      this.logger.error(`Error sincronizando cancha ${event.idCancha}:`, error);
    }
  }

  @OnEvent('parte.eliminada')
  async handleParteEliminada(event: ParteEvent) {
    this.logger.log(`Parte eliminada: Cancha ${event.idCancha} - Disciplina ${event.idDisciplina}`);
    try {
      // Re-sincronizar la cancha completa para actualizar sus disciplinas en Neo4j
      await this.syncService.syncEspacioDeportivo(event.idCancha);
      this.logger.log(`Cancha ${event.idCancha} sincronizada tras eliminar disciplina`);
    } catch (error) {
      this.logger.error(`Error sincronizando cancha ${event.idCancha}:`, error);
    }
  }
}
