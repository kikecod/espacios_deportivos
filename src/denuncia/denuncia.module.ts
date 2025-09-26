import { Module } from '@nestjs/common';
import { DenunciaService } from './denuncia.service';
import { DenunciaController } from './denuncia.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DenunciaModule],
  controllers: [DenunciaController],
  providers: [DenunciaService],
})
export class DenunciaModule {}
