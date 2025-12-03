import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrabajaService } from './trabaja.service';
import { TrabajaController } from './trabaja.controller';
import { Trabaja } from './entities/trabaja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trabaja])],
  controllers: [TrabajaController],
  providers: [TrabajaService],
  exports: [TrabajaService],
})
export class TrabajaModule {}
