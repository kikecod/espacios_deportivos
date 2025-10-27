import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';
import { TransaccionFactura } from 'src/transacciones/entities/transaccion-factura.entity';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { LibelulaService } from './libelula.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Reserva,
      Transaccion,
      TransaccionFactura,
      PasesAcceso,
    ]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        timeout: Number(config.get<string>('LIBELULA_TIMEOUT_MS') ?? '8000'),
      }),
    }),
  ],
  controllers: [PagosController],
  providers: [PagosService, LibelulaService],
  exports: [PagosService],
})
export class PagosModule {}
