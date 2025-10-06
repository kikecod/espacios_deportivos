import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PersonasModule } from './personas/personas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { SedeModule } from './sede/sede.module';
import { CanchaModule } from './cancha/cancha.module';
import { AuthModule } from './auth/auth.module';
import { ReservasModule } from './reservas/reservas.module';
import { ClientesModule } from './clientes/clientes.module';
import { PasesAccesoModule } from './pases_acceso/pases_acceso.module';
import { TransaccionesModule } from './transacciones/transacciones.module';
import { DisciplinaModule } from './disciplina/disciplina.module';
import { ParteModule } from './parte/parte.module';
import { FotosModule } from './fotos/fotos.module';
import { ParticipaModule } from './participa/participa.module';
import { CancelacionModule } from './cancelacion/cancelacion.module';
import { CalificaCanchaModule } from './califica_cancha/califica_cancha.module';
import { DenunciaModule } from './denuncia/denuncia.module';
import { ControladorModule } from './controlador/controlador.module';
import { ControlaModule } from './controla/controla.module';
import { UsuarioRolModule } from './usuario_rol/usuario_rol.module';
import { DueniosModule } from 'src/duenios/duenios.module';
import { TrabajaModule } from './trabaja/trabaja.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, // e.g., 'localhost'
      port: +process.env.DB_PORT!, // e.g., 5432
      database: process.env.DB_NAME, // e.g., 'espacios_deportivos'
      username: process.env.DB_USERNAME, // e.g., 'postgres'
      password: process.env.DB_PASSWORD, // e.g., '123456'
      autoLoadEntities: true, // Automatically load entities
      synchronize: true, // Note: set to false in production
    }),


  PersonasModule,
  UsuariosModule,
  RolesModule,
  SedeModule,
  CanchaModule,
  AuthModule,
  ReservasModule,
  ClientesModule,
  PasesAccesoModule,
  TransaccionesModule,
  DueniosModule,
  DisciplinaModule,
  ParteModule,
  FotosModule,
  ParticipaModule,
  CancelacionModule,
  CalificaCanchaModule,
  DenunciaModule,
  ControladorModule,
  ControlaModule,
  UsuarioRolModule,
  TrabajaModule,
  ],
  controllers: [],
  providers: [AppService],

})
export class AppModule {}
