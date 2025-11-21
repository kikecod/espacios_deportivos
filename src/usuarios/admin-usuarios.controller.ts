import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorators';
import { TipoRol } from '../roles/rol.entity';
import { AdminUsuariosService } from './admin-usuarios.service';
import { FiltrosUsuariosDto } from './dto/filtros-usuarios.dto';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { ActualizarUsuarioAdminDto } from './dto/actualizar-usuario-admin.dto';
import { BajaUsuarioDto } from './dto/baja-usuario.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';


@Auth([TipoRol.ADMIN])
@Controller('admin/usuarios')
export class AdminUsuariosController {
  constructor(private readonly adminUsuariosService: AdminUsuariosService) {}

  /**
   * GET /admin/usuarios
   * Lista todos los usuarios con filtros
   */
  @Get()
  async listarUsuarios(@Query() filtros: FiltrosUsuariosDto) {
    return await this.adminUsuariosService.listarUsuarios(filtros);
  }

  /**
   * GET /admin/usuarios/:id
   * Obtiene detalle completo de un usuario
   */
  @Get(':id')
  async obtenerUsuario(@Param('id', ParseIntPipe) id: number) {
    return await this.adminUsuariosService.obtenerUsuarioDetalle(id);
  }

  /**
   * POST /admin/usuarios
   * Crea un nuevo usuario con persona y roles
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearUsuario(@Body() dto: CrearUsuarioAdminDto) {
    return await this.adminUsuariosService.crearUsuario(dto);
  }

  /**
   * PUT /admin/usuarios/:id
   * Actualiza usuario, persona y roles
   */
  @Put(':id')
  async actualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioAdminDto,
  ) {
    return await this.adminUsuariosService.actualizarUsuario(id, dto);
  }

  /**
   * PUT /admin/usuarios/:id/roles
   * Modifica roles de un usuario
   */
  @Put(':id/roles')
  async modificarRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { roles: TipoRol[] },
  ) {
    return await this.adminUsuariosService.modificarRoles(id, body.roles);
  }

  /**
   * PUT /admin/usuarios/:id/estado
   * Cambia el estado de un usuario
   */
  @Put(':id/estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string; motivo?: string },
  ) {
    return await this.adminUsuariosService.cambiarEstado(
      id,
      body.estado,
      body.motivo,
    );
  }

  /**
   * DELETE /admin/usuarios/:id
   * Baja lógica de usuario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async darDeBajaUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BajaUsuarioDto,
  ) {
    return await this.adminUsuariosService.darDeBaja(id, dto.motivo);
  }

  /**
   * PUT /admin/usuarios/:id/reactivar
   * Reactiva un usuario dado de baja
   */
  @Put(':id/reactivar')
  async reactivarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motivo?: string },
  ) {
    return await this.adminUsuariosService.reactivarUsuario(id, body.motivo);
  }

  /**
   * GET /admin/usuarios/:id/estadisticas
   * Obtiene estadísticas de un usuario
   */
  @Get(':id/estadisticas')
  async obtenerEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return await this.adminUsuariosService.obtenerEstadisticas(id);
  }

  /**
   * PUT /admin/usuarios/:id/contrasena
   * Cambia la contrase\u00f1a de un usuario desde el panel admin
   */
  @Put(':id/contrasena')
  async cambiarContrasenaAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nuevaContrasena: string },
  ) {
    return await this.adminUsuariosService.cambiarContrasenaAdmin(
      id,
      body.nuevaContrasena,
    );
  }

  /**
   * POST /admin/usuarios/:id/avatar
   * Sube o actualiza el avatar de un usuario
   */
  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async subirAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.adminUsuariosService.actualizarAvatar(id, file);
  }

  /**
   * DELETE /admin/usuarios/:id/avatar
   * Elimina el avatar de un usuario
   */
  @Delete(':id/avatar')
  @HttpCode(HttpStatus.OK)
  async eliminarAvatar(@Param('id', ParseIntPipe) id: number) {
    return await this.adminUsuariosService.eliminarAvatar(id);
  }
}
