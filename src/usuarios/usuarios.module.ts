import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { AdminUsuariosController } from './admin-usuarios.controller';
import { AdminUsuariosService } from './admin-usuarios.service';
import { Usuario } from './usuario.entity';
import { PersonasModule } from '../personas/personas.module';
import { Persona } from '../personas/entities/personas.entity';
import { UsuarioRol } from '../usuario_rol/entities/usuario_rol.entity';
import { Rol } from '../roles/rol.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Duenio } from '../duenio/entities/duenio.entity';
import { Controlador } from '../controlador/entities/controlador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Persona,
      UsuarioRol,
      Rol,
      Cliente,
      Duenio,
      Controlador,
    ]),
    PersonasModule
  ],
  controllers: [UsuariosController, AdminUsuariosController],
  providers: [UsuariosService, AdminUsuariosService],
  exports: [TypeOrmModule, UsuariosService, AdminUsuariosService]
})
export class UsuariosModule {}