import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crea un nuevo usuario' })
  @ApiCreatedResponse({ description: 'Usuario creado correctamente' })
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @ApiOperation({ summary: 'Lista usuarios con paginacion y busqueda' })
  @ApiOkResponse({ description: 'Listado paginado obtenido' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.usuariosService.findAll(pagination);
  }

  @Get('count')
  @ApiOperation({ summary: 'Cuenta el total de usuarios' })
  @ApiOkResponse({ description: 'Conteo total devuelto' })
  async count() {
    const total = await this.usuariosService.count();
    return { total };
  }

  @Get('correo/:correo')
  @ApiOperation({ summary: 'Busca un usuario por correo' })
  @ApiOkResponse({ description: 'Usuario encontrado' })
  async findByCorreo(@Param('correo') correo: string) {
    const usuario = await this.usuariosService.findByCorreo(correo);
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get('persona/:id_persona')
  @ApiOperation({ summary: 'Obtiene un usuario por id de persona' })
  @ApiOkResponse({ description: 'Usuario encontrado' })
  async findByPersonaId(@Param('id_persona', ParseIntPipe) id_persona: number) {
    const usuario = await this.usuariosService.findByPersonaId(id_persona);
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un usuario por id' })
  @ApiOkResponse({ description: 'Usuario encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.findOne(id);
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza los datos de un usuario' })
  @ApiOkResponse({ description: 'Usuario actualizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un usuario' })
  @ApiNoContentResponse({ description: 'Usuario eliminado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.remove(id);
  }

  @Post(':id/ultimo-acceso')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualiza la marca de ultimo acceso del usuario' })
  @ApiOkResponse({ description: 'Ultimo acceso actualizado' })
  async actualizarUltimoAcceso(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.actualizarUltimoAcceso(id);
    return { message: 'Ultimo acceso actualizado correctamente' };
  }
}