import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TrabajaService } from './trabaja.service';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@ApiTags('trabaja')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RolesGuard)
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

  @Get(':id_persona_ope/:id_sede')
  findOne(
    @Param('id_persona_ope', ParseIntPipe) id_persona_ope: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
  ) {
    return this.trabajaService.findOne(id_persona_ope, id_sede);
  }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Patch(':id_persona_ope/:id_sede')
  update(
    @Param('id_persona_ope', ParseIntPipe) id_persona_ope: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
    @Body() updateTrabajaDto: UpdateTrabajaDto,
  ) {
    return this.trabajaService.update(id_persona_ope, id_sede, updateTrabajaDto);
  }

  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Delete(':id_persona_ope/:id_sede')
  remove(
    @Param('id_persona_ope', ParseIntPipe) id_persona_ope: number,
    @Param('id_sede', ParseIntPipe) id_sede: number,
  ) {
    return this.trabajaService.remove(id_persona_ope, id_sede);
  }
}
