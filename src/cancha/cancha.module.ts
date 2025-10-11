import { Module } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CanchaController } from './cancha.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cancha } from './entities/cancha.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { DuenioOwnerGuard } from 'src/auth/guard/duenio-owner.guard';


@Module({
  imports: [TypeOrmModule.forFeature([Cancha, Sede]), UsuariosModule],
  controllers: [CanchaController],
  providers: [CanchaService, DuenioOwnerGuard],
})
export class CanchaModule {}
