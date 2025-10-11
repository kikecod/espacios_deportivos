import { Module } from '@nestjs/common';
import { ParticipaService } from './participa.service';
import { ParticipaController } from './participa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participa } from './entities/participa.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participa, Reserva, Cancha, Sede]), UsuariosModule],
  controllers: [ParticipaController],
  providers: [ParticipaService],
})
export class ParticipaModule {}
