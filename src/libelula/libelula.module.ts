import { Module } from '@nestjs/common';
import { LibelulaService } from './libelula.service';
import { LibelulaController } from './libelula.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { TransaccionesModule } from 'src/transacciones/transacciones.module';
import { PasesAccesoModule } from 'src/pases_acceso/pases_acceso.module';
import { ReservasModule } from 'src/reservas/reservas.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import Mail from 'nodemailer/lib/mailer';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TransaccionesModule,
    PasesAccesoModule,
    ReservasModule, // ⭐ Necesario para que no cree otra instancia
    TypeOrmModule.forFeature([Reserva]), // ⭐ Esto habilita el reservaRepository
    MailsModule,
  ],
  controllers: [LibelulaController],
  providers: [LibelulaService],
  exports: [LibelulaService],
})
export class LibelulaModule {}