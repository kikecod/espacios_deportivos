import { Module } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { TransaccionesController } from './transacciones.controller';
import { Transaccion } from './entities/transaccion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { ReservasModule } from 'src/reservas/reservas.module';
import { PasesAccesoModule } from 'src/pases_acceso/pases_acceso.module';
import { MailsModule } from 'src/mails/mails.module';
import { WebsocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaccion, Reserva]),
    ReservasModule,
    PasesAccesoModule, // Importar para generar pases al confirmar pago
    MailsModule,
    WebsocketModule, // Importar para enviar correo de confirmación
  ],  
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  exports: [TypeOrmModule, TransaccionesService],
})
export class TransaccionesModule {}
