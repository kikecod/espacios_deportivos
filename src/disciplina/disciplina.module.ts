import { Module } from '@nestjs/common';
import { DisciplinaService } from './disciplina.service';
import { DisciplinaController } from './disciplina.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Disciplina } from './entities/disciplina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disciplina])],
  controllers: [DisciplinaController],
  providers: [DisciplinaService],
  exports: [TypeOrmModule]
})
export class DisciplinaModule {}
