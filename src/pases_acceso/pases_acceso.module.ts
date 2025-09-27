import { Module } from '@nestjs/common';
import { PasesAccesoService } from './pases_acceso.service';
import { PasesAccesoController } from './pases_acceso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasesAcceso } from './entities/pases_acceso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PasesAcceso])],
  controllers: [PasesAccesoController],
  providers: [PasesAccesoService],
})
export class PasesAccesoModule {}
