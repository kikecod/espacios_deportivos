import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <-- Importar TypeOrmModule
import { CalificaCanchaService } from './califica_cancha.service';
import { CalificaCanchaController } from './califica_cancha.controller';
import { CalificaCancha } from './entities/califica_cancha.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalificaCancha]), // <-- Agregar las entidades aquí
  ],
  controllers: [CalificaCanchaController],
  providers: [CalificaCanchaService],
})
export class CalificaCanchaModule {}
