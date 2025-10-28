import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Cancha, Cliente, Cancelacion])],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}