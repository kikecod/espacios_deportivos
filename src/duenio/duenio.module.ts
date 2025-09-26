import { Module } from '@nestjs/common';
import { DuenioService } from './duenio.service';
import { DuenioController } from './duenio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Duenio } from './entities/duenio.entity';
import { PersonasModule } from 'src/personas/personas.module';
import { PersonasService } from 'src/personas/personas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Duenio]), PersonasModule],
  controllers: [DuenioController],
  providers: [DuenioService, PersonasService],
  exports: [TypeOrmModule]
})
export class DuenioModule {}
