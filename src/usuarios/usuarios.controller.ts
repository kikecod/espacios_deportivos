import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    // No retornar la contraseña hasheada
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get()
  async findAll() {
    const usuarios = await this.usuariosService.findAll();
    // No retornar las contraseñas hasheadas
    return usuarios.map(usuario => {
      const { hash_contrasena, ...usuarioSinContrasena } = usuario;
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
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get('persona/:id_persona')
  async findByPersonaId(@Param('id_persona', ParseIntPipe) id_persona: number) {
    const usuario = await this.usuariosService.findByPersonaId(id_persona);
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.findOne(id);
    const { hash_contrasena, ...usuarioSinContrasena } = usuario;
    return usuarioSinContrasena;
  }

  @Patch(':id')
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
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.remove(id);
  }

  @Post(':id/ultimo-acceso')
  @HttpCode(HttpStatus.OK)
  async actualizarUltimoAcceso(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.actualizarUltimoAcceso(id);
    return { message: 'Último acceso actualizado correctamente' };
  }
}