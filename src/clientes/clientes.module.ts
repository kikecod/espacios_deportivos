import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from 'src/personas/entities/personas.entity';
import { Cliente } from './entities/cliente.entity';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  imports: [TypeOrmModule.forFeature([Cliente, Persona])],
})
export class ClientesModule {}
