import { Module } from '@nestjs/common';
import { ParteService } from './parte.service';
import { ParteController } from './parte.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parte } from './entities/parte.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parte, Cancha, Disciplina])],
  controllers: [ParteController],
  providers: [ParteService],
})
export class ParteModule {}
