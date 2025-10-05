import { Module } from '@nestjs/common';
import { UsuarioRolService } from './usuario_rol.service';
import { UsuarioRolController } from './usuario_rol.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioRol } from './entities/usuario_rol.entity';
import { Rol } from 'src/roles/entities/rol.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioRol, Rol, Usuario])],
  controllers: [UsuarioRolController],
  providers: [UsuarioRolService],
})
export class UsuarioRolModule {}
