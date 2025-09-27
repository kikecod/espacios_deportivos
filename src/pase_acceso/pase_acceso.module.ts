import { Module } from '@nestjs/common';
import { PaseAccesoService } from './pase_acceso.service';
import { PaseAccesoController } from './pase_acceso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaseAcceso } from './entities/pase_acceso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaseAcceso])],
  controllers: [PaseAccesoController],
  providers: [PaseAccesoService],
})
export class PaseAccesoModule {}
