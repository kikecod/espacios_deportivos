import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TrabajaService } from './trabaja.service';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';

@ApiTags('trabaja')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trabaja')
export class TrabajaController {
  constructor(private readonly trabajaService: TrabajaService) {}

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Post()
  create(@Body() createTrabajaDto: CreateTrabajaDto) {
    return this.trabajaService.create(createTrabajaDto);
  }

  @Roles(TipoRol.ADMIN)
  findAll() {
    return this.trabajaService.findAll();
  }

  @Get(':idPersonaOpe/:idSede')
  findOne(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.trabajaService.findOne(idPersonaOpe, idSede);
  }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Patch(':idPersonaOpe/:idSede')
  update(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idSede', ParseIntPipe) idSede: number,
    @Body() updateTrabajaDto: UpdateTrabajaDto,
  ) {
    return this.trabajaService.update(idPersonaOpe, idSede, updateTrabajaDto);
  }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Delete(':idPersonaOpe/:idSede')
  remove(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.trabajaService.remove(idPersonaOpe, idSede);
  }
}
