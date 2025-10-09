import { Module } from '@nestjs/common';
import { TrabajaService } from './trabaja.service';
import { TrabajaController } from './trabaja.controller';
import { Trabaja } from './entities/trabaja.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trabaja, Controlador, Sede])],
  controllers: [TrabajaController],
  providers: [TrabajaService],

})
export class TrabajaModule {}
