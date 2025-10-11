import { Module } from '@nestjs/common';
import { ControladorService } from './controlador.service';
import { ControladorController } from './controlador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controlador } from './entities/controlador.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { Rol } from 'src/roles/entities/rol.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Controlador, Persona, Usuario, UsuarioRol, Rol]), UsuariosModule],
  controllers: [ControladorController],
  providers: [ControladorService],
})
export class ControladorModule {}
