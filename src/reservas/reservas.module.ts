import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';
import { MailsModule } from 'src/mails/mails.module';
import { MailsService } from 'src/mails/mails.service';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { TransaccionesModule } from 'src/transacciones/transacciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Cancha, Cliente, Cancelacion, Usuario]),
    MailsModule,
    UsuariosModule,
  ],
  controllers: [ReservasController],
  providers: [ReservasService, MailsService],
  exports: [TypeOrmModule]
})
export class ReservasModule { }