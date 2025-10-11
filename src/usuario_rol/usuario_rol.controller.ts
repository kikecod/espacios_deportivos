import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsuarioRolService } from './usuario_rol.service';
import { CreateUsuarioRolDto } from './dto/create-usuario_rol.dto';
import { UpdateUsuarioRolDto } from './dto/update-usuario_rol.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';

@ApiTags('usuario-rol')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuario-rol')
export class UsuarioRolController {
  constructor(private readonly usuarioRolService: UsuarioRolService) {}

  @Roles(TipoRol.ADMIN)
  @Post()
  create(@Body() createUsuarioRolDto: CreateUsuarioRolDto) {
    return this.usuarioRolService.create(createUsuarioRolDto);
  }

  @Roles(TipoRol.ADMIN)
  @Get()
  findAll() {
    return this.usuarioRolService.findAll();
  }

  @Roles(TipoRol.ADMIN)
  @Get(':idUsuario/:idRol')
  findOne(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string
  ) {
    return this.usuarioRolService.findOne(+idUsuario, +idRol);
  }

  @Roles(TipoRol.ADMIN)
  @Patch(':idUsuario/:idRol')
  update(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string, 
    @Body() updateUsuarioRolDto: UpdateUsuarioRolDto) {
    return this.usuarioRolService.update(+idUsuario, +idRol, updateUsuarioRolDto);
  }

  @Roles(TipoRol.ADMIN)
  @Patch('restore/:idUsuario/:idRol')
  restore(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string
){
    return this.usuarioRolService.restore(+idUsuario, +idRol);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':idUsuario/:idRol')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('idUsuario') idUsuario: string,
    @Param('idRol') idRol: string, 
  ) {
    return this.usuarioRolService.remove(+idUsuario, +idRol);
  }
}
