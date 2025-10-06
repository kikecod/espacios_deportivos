import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { PersonasModule } from 'src/personas/personas.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

// repos para rol y cliente
import { Rol } from 'src/roles/entities/rol.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES || undefined },
      }),
    }),
    TypeOrmModule.forFeature([Rol, UsuarioRol, Cliente]),
    UsuariosModule,
    PersonasModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
