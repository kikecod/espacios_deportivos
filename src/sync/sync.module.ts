import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { CalificaCancha } from 'src/califica_cancha/entities/califica_cancha.entity';
import { Neo4jModule } from 'src/neo4j/neo4j.module';
import { Neo4jSeedService } from './seed/neo4j-seed.service';
import { PerfilUsuarioTransformer } from './transformers/perfil-usuario.transformer';
import { EspacioDeportivoTransformer } from './transformers/espacio-deportivo.transformer';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { ReservaListener } from './listeners/reserva.listener';
import { CalificacionListener } from './listeners/calificacion.listener';
import { CanchaListener } from './listeners/cancha.listener';
import { ParteListener } from './listeners/parte.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, Cancha, Reserva, CalificaCancha]),
    Neo4jModule,
  ],
  controllers: [SyncController],
  providers: [
    Neo4jSeedService,
    SyncService,
    PerfilUsuarioTransformer,
    EspacioDeportivoTransformer,
    // Listeners
    ReservaListener,
    CalificacionListener,
    CanchaListener,
    ParteListener,
  ],
  exports: [
    Neo4jSeedService,
    SyncService,
    PerfilUsuarioTransformer,
    EspacioDeportivoTransformer,
  ],
})
export class SyncModule {}
