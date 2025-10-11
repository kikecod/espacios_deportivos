// src/clientes/clientes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { SelfOrAdminGuard } from 'src/auth/guard/self-or-admin.guard';
import { UsuariosModule } from 'src/usuarios/usuarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Persona]), UsuariosModule],
  controllers: [ClientesController],
  providers: [ClientesService, SelfOrAdminGuard],  // <- ok
  exports: [ClientesService],                      // (opcional si lo usarás fuera)
})
export class ClientesModule {}
