import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloqueosController } from './bloqueos.controller';
import { BloqueosService } from './bloqueos.service';
import { BloqueoCancha } from './entities/bloqueo_cancha.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloqueoCancha, Cancha])],
  controllers: [BloqueosController],
  providers: [BloqueosService],
  exports: [TypeOrmModule, BloqueosService],
})
export class BloqueosModule {}
