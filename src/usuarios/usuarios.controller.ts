import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { UsuarioSelfOrAdminGuard } from 'src/auth/guard/usuario-self-or-admin.guard';

@ApiTags('usuarios')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Roles(TipoRol.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    // No retornar la contraseña hasheada
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Roles(TipoRol.ADMIN)
  @Get()
  async findAll() {
    const usuarios = await this.usuariosService.findAll();
    // No retornar las contraseñas hasheadas
    return usuarios.map(usuario => {
      const { hashContrasena, ...usuarioSinContrasena } = usuario;
      return usuarioSinContrasena;
    });
  }

  @Roles(TipoRol.ADMIN)
  @Get('count')
  async count() {
    const total = await this.usuariosService.count();
    return { total };
  }

  @Roles(TipoRol.ADMIN)
  @Get('correo/:correo')
  async findByCorreo(@Param('correo') correo: string) {
    const usuario = await this.usuariosService.findByCorreo(correo);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Roles(TipoRol.ADMIN)
  @Get('persona/:idPersona')
  async findByPersonaId(@Param('idPersona', ParseIntPipe) idPersona: number) {
    const usuario = await this.usuariosService.findByPersonaId(idPersona);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get(':id')
  @UseGuards(UsuarioSelfOrAdminGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.findOne(id);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Patch(':id')
  @UseGuards(UsuarioSelfOrAdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);
    const { hashContrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.remove(id);
  }

  @Roles(TipoRol.ADMIN)
  @Post(':id/ultimo-acceso')
  @HttpCode(HttpStatus.OK)
  async actualizarUltimoAcceso(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.actualizarUltimoAcceso(id);
    return { message: 'Último acceso actualizado correctamente' };
  }
}
