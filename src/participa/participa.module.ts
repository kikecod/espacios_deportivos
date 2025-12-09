import { Module } from '@nestjs/common';
import { ParticipaService } from './participa.service';
import { ParticipaController } from './participa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participa } from './entities/participa.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participa, Reserva, Cliente, Persona, Usuario]),
    MailsModule,
  ],
  controllers: [ParticipaController],
  providers: [ParticipaService],
})
export class ParticipaModule {}
