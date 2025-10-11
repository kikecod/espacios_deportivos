import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';
import { Persona } from './entities/personas.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PersonaSelfOrAdminGuard } from 'src/auth/guard/persona-self-or-admin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Persona]), forwardRef(() => UsuariosModule)],
  controllers: [PersonasController],
  providers: [PersonasService, PersonaSelfOrAdminGuard],
  exports: [TypeOrmModule, PersonasService], // Exportamos el servicio para uso en otros módulos
})
export class PersonasModule {}
