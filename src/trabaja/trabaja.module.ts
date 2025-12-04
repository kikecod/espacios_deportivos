import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrabajaService } from './trabaja.service';
import { TrabajaController } from './trabaja.controller';
import { Trabaja } from './entities/trabaja.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Rol } from 'src/roles/rol.entity';
import { PersonasModule } from 'src/personas/personas.module';
import { UsuarioRolModule } from 'src/usuario_rol/usuario_rol.module';
import { PersonasService } from 'src/personas/personas.service';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';
import { ControlaModule } from 'src/controla/controla.module';
import { ControladorService } from 'src/controlador/controlador.service';
import { ControladorModule } from 'src/controlador/controlador.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trabaja, Persona, Usuario, Rol]), PersonasModule, UsuarioRolModule, ControladorModule],
  controllers: [TrabajaController],
  providers: [TrabajaService, PersonasService, UsuarioRolService, ControladorService],
  exports: [TrabajaService],
})
export class TrabajaModule {}
