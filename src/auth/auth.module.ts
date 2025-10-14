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

@Module({
  imports: [UsuariosModule,
    JwtModule.register({
      global:true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    UsuarioRolModule,
    RolesModule,
    ClientesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsuarioRolService, ClientesService]
})
export class AuthModule {}
