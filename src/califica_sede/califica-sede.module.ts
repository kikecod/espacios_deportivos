import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalificaSedeService } from './califica-sede.service';
import { CalificaSedeController } from './califica-sede.controller';
import { CalificaSede } from './entities/califica-sede.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalificaSede, Reserva, Sede]),
  ],
  controllers: [CalificaSedeController],
  providers: [CalificaSedeService],
  exports: [CalificaSedeService],
})
export class CalificaSedeModule {}
