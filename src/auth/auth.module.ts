import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { UsuarioRolModule } from 'src/usuario_rol/usuario_rol.module';
import { UsuarioRolService } from 'src/usuario_rol/usuario_rol.service';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [UsuariosModule,
    JwtModule.register({
      global:true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    UsuarioRolModule,
    RolesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsuarioRolService]
})
export class AuthModule {}
