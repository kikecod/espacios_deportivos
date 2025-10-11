import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DueniosService } from './duenios.service';
import { DueniosController } from './duenios.controller';
import { Duenio } from './entities/duenio.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Duenio, Persona]), UsuariosModule],
  controllers: [DueniosController],
  providers: [DueniosService],
  exports: [DueniosService],
})
export class DueniosModule {}
