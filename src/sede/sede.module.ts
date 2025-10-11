import { Module } from '@nestjs/common';
import { SedeService } from './sede.service';
import { SedeController } from './sede.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sede } from './entities/sede.entity';
import { Duenio } from 'src/duenios/entities/duenio.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { DuenioOwnerGuard } from 'src/auth/guard/duenio-owner.guard';


@Module({
  imports: [TypeOrmModule.forFeature([Sede, Duenio, Cancha]), UsuariosModule],
  controllers: [SedeController],
  providers: [SedeService, DuenioOwnerGuard],
  exports: [TypeOrmModule],
})
export class SedeModule {}
