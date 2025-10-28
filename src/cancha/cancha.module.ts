import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanchaController } from './cancha.controller';
import { CanchaService } from './cancha.service';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cancha, Sede])],
  controllers: [CanchaController],
  providers: [CanchaService],
  exports: [CanchaService],
})
export class CanchaModule {}
