import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './usuario.entity';
import { PersonasModule } from '../personas/personas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    PersonasModule
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [TypeOrmModule, UsuariosService]
})
export class UsuariosModule {}