import { Module } from '@nestjs/common';
import { PaseAccesoService } from './pase_acceso.service';
import { PaseAccesoController } from './pase_acceso.controller';

@Module({
  controllers: [PaseAccesoController],
  providers: [PaseAccesoService],
})
export class PaseAccesoModule {}
