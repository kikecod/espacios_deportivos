import { Module } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { TransaccionesController } from './transacciones.controller';
import { Transaccion } from './entities/transaccion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { ReservasModule } from 'src/reservas/reservas.module';
import { PasesAccesoModule } from 'src/pases_acceso/pases_acceso.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaccion, Reserva]),
    ReservasModule,
    PasesAccesoModule // Importar para generar pases al confirmar pago
  ],  
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
})
export class TransaccionesModule {}
