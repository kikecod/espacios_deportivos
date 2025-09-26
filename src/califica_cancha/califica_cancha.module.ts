import { Module } from '@nestjs/common';
import { CalificaCanchaService } from './califica_cancha.service';
import { CalificaCanchaController } from './califica_cancha.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CalificaCanchaModule],
  controllers: [CalificaCanchaController],
  providers: [CalificaCanchaService],
})
export class CalificaCanchaModule {}
