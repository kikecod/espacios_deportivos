import { Module } from '@nestjs/common';
import { SedeService } from './sede.service';
import { SedeController } from './sede.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Duenio } from 'src/duenio/entities/duenio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sede, Duenio])],
  controllers: [SedeController],
  providers: [SedeService],
  exports: [TypeOrmModule],
})
export class SedeModule {}
