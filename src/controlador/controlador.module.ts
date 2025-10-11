import { Module } from '@nestjs/common';
import { ControladorService } from './controlador.service';
import { ControladorController } from './controlador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Controlador } from './entities/controlador.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Controlador]), UsuariosModule],
  controllers: [ControladorController],
  providers: [ControladorService],
})
export class ControladorModule {}
