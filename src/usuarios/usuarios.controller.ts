import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateUsuarioProfileDto } from './dto/update-usuario-profile.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    // No retornar la contraseña hasheada
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get()
  async findAll() {
    const usuarios = await this.usuariosService.findAll();
    // No retornar las contraseñas hasheadas
    return usuarios.map(usuario => {
      const { hashContrasena, ...usuarioSinContrasena } = usuario;
      return usuarioSinContrasena;
    });
  }

  @Get('count')
  async count() {
    const total = await this.usuariosService.count();
    return { total };
  }

  @Get('correo/:correo')
  async findByCorreo(@Param('correo') correo: string) {
    const usuario = await this.usuariosService.findByCorreo(correo);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get('persona/:idPersona')
  async findByPersonaId(@Param('idPersona', ParseIntPipe) idPersona: number) {
    const usuario = await this.usuariosService.findByPersonaId(idPersona);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.findOne(id);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.remove(id);
  }

  @Post(':id/ultimo-acceso')
  @HttpCode(HttpStatus.OK)
  async actualizarUltimoAcceso(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.actualizarUltimoAcceso(id);
    return { message: 'Último acceso actualizado correctamente' };
  }

  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioProfileDto: UpdateUsuarioProfileDto,
    @ActiveUser() user: any
  ) {
    return await this.usuariosService.updateProfile(id, user.idUsuario, updateUsuarioProfileDto);
  }

  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO, TipoRol.CONTROLADOR])
  @Put(':id/cambiar-contrasena')
  @HttpCode(HttpStatus.OK)
  async cambiarContrasena(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarContrasenaDto: CambiarContrasenaDto,
    @ActiveUser() user: any
  ) {
    return await this.usuariosService.cambiarContrasena(id, user.idUsuario, cambiarContrasenaDto.nuevaContrasena);
  }
}