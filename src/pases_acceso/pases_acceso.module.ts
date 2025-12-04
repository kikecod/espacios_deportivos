import { Module, forwardRef } from '@nestjs/common';
import { PasesAccesoService } from './pases_acceso.service';
import { PasesAccesoController } from './pases_acceso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasesAcceso } from './entities/pases_acceso.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Controla } from 'src/controla/entities/controla.entity';
import { Trabaja } from 'src/trabaja/entities/trabaja.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasesAcceso,
      Reserva,
      Controla,
      Trabaja,
    ])
  ],
  controllers: [PasesAccesoController],
  providers: [PasesAccesoService],
  exports: [PasesAccesoService] // Exportar para usar en ReservasModule
})
export class PasesAccesoModule {}
