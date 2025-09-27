import { Module } from '@nestjs/common';
import { ControladorService } from './controlador.service';
import { ControladorController } from './controlador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controlador } from './entities/controlador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Controlador])],
  controllers: [ControladorController],
  providers: [ControladorService],
})
export class ControladorModule {}
