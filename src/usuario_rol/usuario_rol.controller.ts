import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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

  @Get(':id_usuario/:id_rol')
  findOne(
    @Param('id_usuario') id_usuario: string,
    @Param('id_rol') id_rol: string,
  ) {
    return this.usuarioRolService.findOne(+id_usuario, +id_rol);
  }

  @Patch(':id_usuario/:id_rol')
  update(
    @Param('id_usuario') id_usuario: string,
    @Param('id_rol') id_rol: string,
    @Body() updateUsuarioRolDto: UpdateUsuarioRolDto,
  ) {
    return this.usuarioRolService.update(
      +id_usuario,
      +id_rol,
      updateUsuarioRolDto,
    );
  }

  @Patch('restore/:id_usuario/:id_rol')
  restore(
    @Param('id_usuario') id_usuario: string,
    @Param('id_rol') id_rol: string,
  ) {
    return this.usuarioRolService.restore(+id_usuario, +id_rol);
  }

  @Delete(':id_usuario/:id_rol')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id_usuario') id_usuario: string,
    @Param('id_rol') id_rol: string,
  ) {
    return this.usuarioRolService.remove(+id_usuario, +id_rol);
  }
}
