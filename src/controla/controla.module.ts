import { Module } from '@nestjs/common';
import { ControlaService } from './controla.service';
import { ControlaController } from './controla.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controla } from './entities/controla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Controla])],
  controllers: [ControlaController],
  providers: [ControlaService],
})
export class ControlaModule {}
