import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RedisModule } from './common/redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { HealthController } from './health/health.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().allow(''),
        DB_NAME: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_TTL: Joi.string().default('15m'),
        CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
        REDIS_HOST: Joi.string().default('127.0.0.1'),
        REDIS_PORT: Joi.number().default(6379),
        INACTIVITY_MINUTES: Joi.number().default(15),
        TOLERANCE_MINUTES: Joi.number().default(10),
      })
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    RedisModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              host: configService.get<string>('DB_HOST') || 'localhost',
              port: parseInt(configService.get<string>('DB_PORT') || '5432'),
              username: configService.get<string>('DB_USERNAME') || 'postgres',
              password: configService.get<string>('DB_PASSWORD') || '123456',
              database: configService.get<string>('DB_NAME') || 'espacios_deportivos',
              autoLoadEntities: true,
              synchronize: configService.get('NODE_ENV') === 'development',
              logging: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
          }),
        ]),


  ...(process.env.NODE_ENV === 'test'
    ? []
    : [
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
      ]),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],

})
export class AppModule {}
