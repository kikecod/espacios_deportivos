import { Module } from '@nestjs/common';
import { TrabajaService } from './trabaja.service';
import { TrabajaController } from './trabaja.controller';
import { Type } from 'class-transformer';
import { Trabaja } from './entities/trabaja.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({

  imports: [TypeOrmModule.forFeature([Trabaja])],
  controllers: [TrabajaController],
  providers: [TrabajaService],

})
export class TrabajaModule {}
