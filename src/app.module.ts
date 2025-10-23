import { CacheModule } from '@nestjs/cache-manager';
import { randomUUID } from 'crypto';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { join } from 'path';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CalificaCanchaModule } from './califica_cancha/califica_cancha.module';
import { CancelacionModule } from './cancelacion/cancelacion.module';
import { CanchaModule } from './cancha/cancha.module';
import { ClientesModule } from './clientes/clientes.module';
import { ControlaModule } from './controla/controla.module';
import { ControladorModule } from './controlador/controlador.module';
import { DenunciaModule } from './denuncia/denuncia.module';
import { DisciplinaModule } from './disciplina/disciplina.module';
import { DuenioModule } from './duenio/duenio.module';
import { FotosModule } from './fotos/fotos.module';
import { HealthModule } from './health/health.module';
import { ParteModule } from './parte/parte.module';
import { PasesAccesoModule } from './pases_acceso/pases_acceso.module';
import { ParticipaModule } from './participa/participa.module';
import { PersonasModule } from './personas/personas.module';
import { ReservasModule } from './reservas/reservas.module';
import { RolesModule } from './roles/roles.module';
import { SedeModule } from './sede/sede.module';
import { TrabajaModule } from './trabaja/trabaja.module';
import { TransaccionesModule } from './transacciones/transacciones.module';
import { UsuarioRolModule } from './usuario_rol/usuario_rol.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            level: configService.get<string>('LOG_LEVEL') ?? (isProduction ? 'info' : 'debug'),
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:standard',
                  },
                },
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie'],
              censor: '[Redacted]',
            },
            genReqId: (
              req: { headers?: Record<string, unknown> },
              res: { setHeader?: (key: string, value: string) => void },
            ) => {
              const headerId = req.headers?.['x-request-id'] as string | undefined;
              const id = headerId ?? randomUUID();
              res.setHeader?.('x-request-id', id);
              return id;
            },
            customProps: () => ({ context: 'HTTP' }),
          },
        };
      },
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        ttl: parseInt(configService.get<string>('CACHE_TTL_SECONDS') ?? '60', 10),
        max: parseInt(configService.get<string>('CACHE_MAX_ITEMS') ?? '100', 10),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
        username:
          configService.get<string>('DB_USERNAME') ??
          configService.get<string>('DB_USER') ??
          'postgres',
        password: configService.get<string>('DB_PASSWORD') ?? '123456',
        database: configService.get<string>('DB_NAME') ?? 'espacios_deportivos',
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
        migrationsRun: configService.get<string>('DB_RUN_MIGRATIONS') === 'true',
        migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
        logging: configService.get<string>('DB_LOGGING') === 'true',
      }),
      inject: [ConfigService],
    }),
    PrometheusModule.register(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'global',
          ttl: parseInt(configService.get<string>('THROTTLE_GLOBAL_TTL') ?? '60', 10),
          limit: parseInt(configService.get<string>('THROTTLE_GLOBAL_LIMIT') ?? '120', 10),
        },
        {
          name: 'login',
          ttl: parseInt(configService.get<string>('THROTTLE_LOGIN_TTL') ?? '60', 10),
          limit: parseInt(configService.get<string>('THROTTLE_LOGIN_LIMIT') ?? '5', 10),
        },
        {
          name: 'sensitive',
          ttl: parseInt(configService.get<string>('THROTTLE_SENSITIVE_TTL') ?? '300', 10),
          limit: parseInt(configService.get<string>('THROTTLE_SENSITIVE_LIMIT') ?? '10', 10),
        },
      ],
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
    TrabajaModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
