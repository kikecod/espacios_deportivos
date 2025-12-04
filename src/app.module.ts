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
import { CalificaSedeModule } from './califica_sede/califica-sede.module';
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
import { MailsModule } from './mails/mails.module';
import { SearchModule } from './search/search.module';
import { FavoritoModule } from './favorito/favorito.module';
import { ApiPersonaModule } from './api-persona/api-persona.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LibelulaModule } from './libelula/libelula.module';
import { WebsocketModule } from './websocket/websocket.module';
import { S3Module } from './s3/s3.module';
import { TrabajaModule } from './trabaja/trabaja.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
          res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, Cache-Control, X-Requested-With, Accept, Origin',
          );
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        },
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || '123456',
        database: configService.get<string>('DB_NAME') || 'espacios_deportivos',
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true' || true,
        ssl: configService.get<string>('DB_SSL') === 'true',
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
    CalificaSedeModule,
    DenunciaModule,
    ControladorModule,
    ControlaModule,
    UsuarioRolModule,
    DatabaseModule,
    AnalyticsModule,
    ReportesModule,
    ProfileModule,
    MailsModule,
    SearchModule,
    FavoritoModule,
    ApiPersonaModule,
    DashboardModule,
    LibelulaModule,
    WebsocketModule,
    S3Module,
    TrabajaModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
