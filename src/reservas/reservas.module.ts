import { Module, forwardRef } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';
import { PasesAccesoModule } from 'src/pases_acceso/pases_acceso.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, Cancha, Cliente, Cancelacion]),
    PasesAccesoModule // Importar para usar el servicio de pases
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [TypeOrmModule, ReservasService]
})
export class ReservasModule {}
