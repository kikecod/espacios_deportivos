import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRolDto: CreateRolDto) {
    return await this.rolesService.create(createRolDto);
  }

  @Get()
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get('count')
  async count() {
    const total = await this.rolesService.count();
    return { total };
  }

  @Get('count/active')
  async countActive() {
    const total = await this.rolesService.countActive();
    return { total };
  }

  @Get('usuario/:idUsuario')
  async findByUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return await this.rolesService.findByUsuario(idUsuario);
  }

  @Get('usuario/:idUsuario/active')
  async findActiveByUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return await this.rolesService.findActiveByUsuario(idUsuario);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return await this.rolesService.update(id, updateRolDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.remove(id);
  }

  @Post(':id/revocar')
  @HttpCode(HttpStatus.OK)
  async revocarRol(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.revocarRol(id);
  }

  @Post(':id/activar')
  @HttpCode(HttpStatus.OK)
  async activarRol(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.activarRol(id);
  }
}