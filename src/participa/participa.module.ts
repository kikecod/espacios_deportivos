import { Module } from '@nestjs/common';
import { ParticipaService } from './participa.service';
import { ParticipaController } from './participa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participa } from './entities/participa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participa])],
  controllers: [ParticipaController],
  providers: [ParticipaService],
})
export class ParticipaModule {}
