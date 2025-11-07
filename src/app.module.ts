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
import { DuenioModule } from './duenio/duenio.module';
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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportesModule } from './reportes/reportes.module';
import { ProfileModule } from './profile/profile.module';
import { SearchModule } from './search/search.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '5432'),
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || '123456',
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
  ReservasModule,
  ClientesModule,
  PasesAccesoModule,
  TransaccionesModule,
  DuenioModule,
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
  DatabaseModule,
  AnalyticsModule,
  ReportesModule,
  ProfileModule,
  SearchModule,
  ],
  controllers: [],
  providers: [AppService],

})
export class AppModule {}
