import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';
import { CalificaCancha } from 'src/califica_cancha/entities/califica_cancha.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reserva,
      Transaccion,
      CalificaCancha,
      Cancha,
      Cancelacion,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
