import { Module } from '@nestjs/common';
import { DenunciaService } from './denuncia.service';
import { DenunciaController } from './denuncia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Denuncia } from './entities/denuncia.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { Sede } from 'src/sede/entities/sede.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Denuncia, Sede, Cancha, Cliente]),
    UsuariosModule,
  ],
  controllers: [DenunciaController],
  providers: [DenunciaService],
})
export class DenunciaModule {}
