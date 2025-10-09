import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TrabajaService } from './trabaja.service';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';

@Controller('trabaja')
export class TrabajaController {
  constructor(private readonly trabajaService: TrabajaService) {}

  @Post()
  create(@Body() createTrabajaDto: CreateTrabajaDto) {
    return this.trabajaService.create(createTrabajaDto);
  }

  @Get()
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

  @Patch(':idPersonaOpe/:idSede')
  update(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idSede', ParseIntPipe) idSede: number,
    @Body() updateTrabajaDto: UpdateTrabajaDto,
  ) {
    return this.trabajaService.update(idPersonaOpe, idSede, updateTrabajaDto);
  }

  @Delete(':idPersonaOpe/:idSede')
  remove(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.trabajaService.remove(idPersonaOpe, idSede);
  }
}
