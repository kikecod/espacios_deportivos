import { Module } from '@nestjs/common';
import { DenunciaService } from './denuncia.service';
import { DenunciaController } from './denuncia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Denuncia } from './entities/denuncia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Denuncia]), // <-- Agregar las entidades aquí
  ],
  controllers: [DenunciaController],
  providers: [DenunciaService],
})
export class DenunciaModule {}
