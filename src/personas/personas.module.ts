import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';
import { Persona } from './entities/personas.entity';
import { Usuario } from 'src/usuarios/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Persona, Usuario])],
  controllers: [PersonasController],
  providers: [PersonasService],
  exports: [TypeOrmModule, PersonasService], // Exportamos el servicio para uso en otros módulos
})
export class PersonasModule {}