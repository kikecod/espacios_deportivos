// cancelacion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancelacionService } from './cancelacion.service';
import { CancelacionController } from './cancelacion.controller';
import { Cancelacion } from './entities/cancelacion.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cancelacion, Reserva, Cliente]), UsuariosModule],
  controllers: [CancelacionController],
  providers: [CancelacionService],
  exports: [CancelacionService],
})
export class CancelacionModule {}
