import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, Put, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdateUsuarioProfileDto } from './dto/update-usuario-profile.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { AdminUsuariosService } from './admin-usuarios.service';
import { FiltrosUsuariosDto } from './dto/filtros-usuarios.dto';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { ActualizarUsuarioAdminDto } from './dto/actualizar-usuario-admin.dto';
import { BajaUsuarioDto } from './dto/baja-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly adminUsuariosService: AdminUsuariosService,
  ) {}

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

  /**
   * Rutas de administración de usuarios reutilizando AdminUsuariosService
   * GET /api/usuarios/admin?rol=&estado=&buscar=&page=&limit=
   */
  @Auth([TipoRol.ADMIN])
  @Get('admin')
  async listarUsuariosAdmin(@Query() filtros: FiltrosUsuariosDto) {
    return this.adminUsuariosService.listarUsuarios(filtros);
  }

  /**
   * GET /api/usuarios/admin/:id
   * Detalle completo de usuario para admin
   */
  @Auth([TipoRol.ADMIN])
  @Get('admin/:id')
  async obtenerUsuarioAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminUsuariosService.obtenerUsuarioDetalle(id);
  }

  /**
   * POST /api/usuarios/admin
   * Crear usuario desde panel admin
   */
  @Auth([TipoRol.ADMIN])
  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  async crearUsuarioAdmin(@Body() dto: CrearUsuarioAdminDto) {
    return this.adminUsuariosService.crearUsuario(dto);
  }

  /**
   * PUT /api/usuarios/admin/:id
   * Actualizar usuario desde panel admin
   */
  @Auth([TipoRol.ADMIN])
  @Put('admin/:id')
  async actualizarUsuarioAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioAdminDto,
  ) {
    return this.adminUsuariosService.actualizarUsuario(id, dto);
  }

  /**
   * DELETE /api/usuarios/admin/:id
   * Baja lógica de usuario (ELIMINADO)
   */
  @Auth([TipoRol.ADMIN])
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  async darDeBajaUsuarioAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BajaUsuarioDto,
  ) {
    return this.adminUsuariosService.darDeBaja(id, dto.motivo);
  }

  /**
   * PUT /api/usuarios/admin/:id/reactivar
   * Reactivar usuario dado de baja
   */
  @Auth([TipoRol.ADMIN])
  @Put('admin/:id/reactivar')
  async reactivarUsuarioAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motivo?: string },
  ) {
    return this.adminUsuariosService.reactivarUsuario(id, body.motivo);
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
