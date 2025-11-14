import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeederService } from './database-seeder.service';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { Rol } from 'src/roles/rol.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Disciplina, 
      Rol, 
      Persona, 
      Usuario, 
      UsuarioRol
    ])
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}
