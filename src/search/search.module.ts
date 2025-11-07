import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cancha, Sede, Reserva, Disciplina]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
