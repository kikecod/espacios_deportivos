import { Module } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { TransaccionesController } from './transacciones.controller';
import { Transaccion } from './entities/transaccion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { ReservasModule } from 'src/reservas/reservas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaccion, Reserva]), ReservasModule],  
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  exports: [TypeOrmModule, TransaccionesService],
})
export class TransaccionesModule {}
