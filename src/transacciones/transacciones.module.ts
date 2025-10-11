import { Module } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { TransaccionesController } from './transacciones.controller';
import { Transaccion } from './entities/transaccion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaccion, Reserva]), UsuariosModule],  
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
})
export class TransaccionesModule {}
