import { Module } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CanchaController } from './cancha.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { SedeModule } from 'src/sede/sede.module';
import { SedeService } from 'src/sede/sede.service';
import { DuenioModule } from 'src/duenio/duenio.module';
import { PersonasModule } from 'src/personas/personas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cancha, Sede, Reserva]), SedeModule],
  controllers: [CanchaController],
  providers: [CanchaService, SedeService],
})
export class CanchaModule {}
