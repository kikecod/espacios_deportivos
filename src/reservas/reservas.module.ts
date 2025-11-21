import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { MailsModule } from 'src/mails/mails.module';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PasesAccesoModule } from 'src/pases_acceso/pases_acceso.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, Cancha, Cliente, Cancelacion, Usuario]),
    MailsModule,
    UsuariosModule,
    PasesAccesoModule, // Importar para usar el servicio de pases
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [TypeOrmModule, ReservasService],
})
export class ReservasModule {}