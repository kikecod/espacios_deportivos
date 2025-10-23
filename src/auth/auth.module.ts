import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { UsuarioRolModule } from 'src/usuario_rol/usuario_rol.module';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';
import { RolesModule } from 'src/roles/roles.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { ClientesService } from 'src/clientes/clientes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthToken } from './entities/auth-token.entity';
import { AuthTokenService } from './auth-token.service';

@Module({
  imports: [UsuariosModule,
    TypeOrmModule.forFeature([AuthToken]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.accessSecret,
      signOptions: { expiresIn: jwtConstants.accessTokenExpiresIn },
    }),
    UsuarioRolModule,
    RolesModule,
    ClientesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsuarioRolService, ClientesService, AuthTokenService]
})
export class AuthModule {}
