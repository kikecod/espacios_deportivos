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
import { EntidadModule } from './entidad/entidad.module';
import { ControladorModule } from './controlador/controlador.module';
import { ControlaModule } from './controla/controla.module';
import { ReservaModule } from './reserva/reserva.module';
import { PaseAccesoModule } from './pase_acceso/pase_acceso.module';
import { ClienteModule } from './cliente/cliente.module';
import { CalificaCanchaModule } from './califica_cancha/califica_cancha.module';
import { DenunciaModule } from './denuncia/denuncia.module';
import { ReservasModule } from './reservas/reservas.module';
import { ClientesModule } from './clientes/clientes.module';
import { PasesAccesoModule } from './pases_acceso/pases_acceso.module';
import { TransaccionesModule } from './transacciones/transacciones.module';
import { DuenioModule } from './duenio/duenio.module';
import { DisciplinaModule } from './disciplina/disciplina.module';
import { ParteModule } from './parte/parte.module';
import { FotosModule } from './fotos/fotos.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '8085'),
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || '1234',
        database: configService.get<string>('DB_NAME') || 'espacios_deportivos',
        //entities: [Persona, Usuario, Rol, Cancha, Sede],
        autoLoadEntities: true,
        synchronize: true,
        //synchronize: configService.get('NODE_ENV') === 'development', // Solo en desarrollo
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  PersonasModule,
  UsuariosModule,
  RolesModule,
  SedeModule,
  CanchaModule,
  AuthModule,
  EntidadModule,
  ControladorModule,
  ControlaModule,
  ReservaModule,
  PaseAccesoModule,
  ClienteModule,
  CalificaCanchaModule,
  DenunciaModule,
  ReservasModule,
  ClientesModule,
  PasesAccesoModule,
  TransaccionesModule,
  DuenioModule,
  DisciplinaModule,
  ParteModule,
  FotosModule,
  ],
  controllers: [],
  providers: [AppService],

})
export class AppModule {}
