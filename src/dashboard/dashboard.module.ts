import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Sede } from 'src/sede/entities/sede.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sede, Cancha, Reserva, Usuario]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
