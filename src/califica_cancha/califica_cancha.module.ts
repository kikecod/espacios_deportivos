import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CalificaCanchaService } from './califica_cancha.service';
import { CalificaCanchaController } from './califica_cancha.controller';
import { CalificaCancha } from './entities/califica_cancha.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { Cancha } from '../cancha/entities/cancha.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalificaCancha,
      Reserva,   // Para validación de 14 días
      Cancha,    // Para actualizar rating
      Cliente,   // Para obtener idCliente desde idUsuario
      Usuario,   // Para obtener avatarPath del usuario
    ]),
    JwtModule,   // Para AuthGuard
  ],
  controllers: [CalificaCanchaController],
  providers: [CalificaCanchaService],
  exports: [CalificaCanchaService],
})
export class CalificaCanchaModule {}
