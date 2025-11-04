import { Module } from '@nestjs/common';
import { DuenioService } from './duenio.service';
import { DuenioController } from './duenio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Duenio } from './entities/duenio.entity';
import { PersonasModule } from 'src/personas/personas.module';
import { PersonasService } from 'src/personas/personas.service';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Rol } from 'src/roles/rol.entity';
import { UsuarioRolModule } from 'src/usuario_rol/usuario_rol.module';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';

@Module({
  imports: [TypeOrmModule.forFeature([Duenio, Persona, Usuario, Rol]), PersonasModule, UsuarioRolModule],
  controllers: [DuenioController],
  providers: [DuenioService, PersonasService, UsuarioRolService],
  exports: [TypeOrmModule, DuenioService],
})
export class DuenioModule {}
