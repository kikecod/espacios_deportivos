import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { DuenioOwnerGuard } from 'src/auth/guard/duenio-owner.guard';
import { ListQueryDto } from 'src/common/dto/list-query.dto';

@Controller('cancha')
export class CanchaController {
  constructor(
    private readonly canchaService: CanchaService,
  ) {}

  // Public/cliente: puede ver canchas
  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.canchaService.findAllPaged(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.canchaService.findOne(id);
  }

  // Dueño (propietario de la sede) o ADMIN: crear/editar/eliminar
  @UseGuards(JwtAuthGuard, RolesGuard, DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Post()
  create(@Body() createCanchaDto: CreateCanchaDto) {
    return this.canchaService.create(createCanchaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCanchaDto: UpdateCanchaDto) {
    return this.canchaService.update(+id, updateCanchaDto);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard, DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Patch('restore/:id')
  restore(@Param('id', ParseIntPipe) id: number){
    return this.canchaService.restore(id);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard, DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.canchaService.remove(id);
  }
}
