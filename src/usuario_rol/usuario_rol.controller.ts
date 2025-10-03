import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuarioRolService } from './usuario_rol.service';
import { CreateUsuarioRolDto } from './dto/create-usuario_rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario_rol.dto';

@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly usuarioRolService: UsuarioRolService) {}

  @Post()
  create(@Body() createUsuarioRolDto: CreateUsuarioRolDto) {
    return this.usuarioRolService.create(createUsuarioRolDto);
  }

  @Get()
  findAll() {
    return this.usuarioRolService.findAll();
  }

  @Get(':idUsuario/:idRol')
  findOne(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string
  ) {
    return this.usuarioRolService.findOne(+idUsuario, +idRol);
  }

  @Patch(':idUsuario/:idRol')
  update(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string, 
    @Body() updateUsuarioRolDto: UpdateUsuarioRolDto) {
    return this.usuarioRolService.update(+idUsuario, +idRol, updateUsuarioRolDto);
  }

  @Patch('restore/:idUsuario/:idRol')
  restore(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string
){
    return this.usuarioRolService.restore(+idUsuario, +idRol);
  }

  @Delete(':idUsuario/:idRol')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string, 
  ) {
    return this.usuarioRolService.remove(+idUsuario, +idRol);
  }
}
