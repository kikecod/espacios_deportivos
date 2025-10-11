import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DueniosService } from './duenios.service';
import { DueniosController } from './duenios.controller';
import { Duenio } from './entities/duenio.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { Rol } from 'src/roles/entities/rol.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Duenio, Persona, Usuario, UsuarioRol, Rol]), UsuariosModule],
  controllers: [DueniosController],
  providers: [DueniosService],
  exports: [DueniosService],
})
export class DueniosModule {}
