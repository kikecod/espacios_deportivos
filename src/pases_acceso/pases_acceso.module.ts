import { Module } from '@nestjs/common';
import { PasesAccesoService } from './pases_acceso.service';
import { PasesAccesoController } from './pases_acceso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasesAcceso } from './entities/pases_acceso.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Controla } from 'src/controla/entities/controla.entity';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { Trabaja } from 'src/trabaja/entities/trabaja.entity';
import { ReservaOwnerOrAdminGuard } from 'src/auth/guard/reserva-owner.guard';

@Module({
  imports: [TypeOrmModule.forFeature([PasesAcceso, Reserva, Controla, Controlador, Trabaja]), UsuariosModule],
  controllers: [PasesAccesoController],
  providers: [PasesAccesoService, ReservaOwnerOrAdminGuard],
})
export class PasesAccesoModule {}
