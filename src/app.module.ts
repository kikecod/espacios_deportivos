import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PersonasModule } from './personas/personas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { Persona } from './personas/personas.entity';
import { Usuario } from './usuarios/usuario.entity';
import { Rol } from './roles/rol.entity';
import { Cancha } from './cancha/entities/cancha.entity';
import { Sede } from './sede/entities/sede.entity';
import { SedeModule } from './sede/sede.module';
import { CanchaModule } from './cancha/cancha.module';
import { AuthModule } from './auth/auth.module';
import { DuenioModule } from './duenio/duenio.module';

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
  DuenioModule,
  ],
  controllers: [],
  providers: [AppService],

})
export class AppModule {}
