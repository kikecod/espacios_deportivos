import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva])],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}




