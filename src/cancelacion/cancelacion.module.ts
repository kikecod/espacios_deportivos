// cancelacion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancelacionService } from './cancelacion.service';
import { CancelacionController } from './cancelacion.controller';
import { Cancelacion } from './entities/cancelacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cancelacion])],
  controllers: [CancelacionController],
  providers: [CancelacionService],
  exports: [CancelacionService],
})
export class CancelacionModule {}
