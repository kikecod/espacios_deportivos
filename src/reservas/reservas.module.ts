import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { Reserva } from './entities/reserva.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Cancha]), UsuariosModule, ClientesModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
