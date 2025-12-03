import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrabajaService } from './trabaja.service';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';
import { Trabaja } from './entities/trabaja.entity';

@Controller('trabaja')
export class TrabajaController {
  constructor(private readonly trabajaService: TrabajaService) {}

  @Post()
  create(@Body() createTrabajaDto: CreateTrabajaDto): Promise<Trabaja> {
    return this.trabajaService.create(createTrabajaDto);
  }

  @Get()
  findAll(): Promise<Trabaja[]> {
    return this.trabajaService.findAll();
  }

  @Get(':idPersonaOpe/:idSede')
  findOne(
    @Param('idPersonaOpe') idPersonaOpe: string,
    @Param('idSede') idSede: string,
  ): Promise<Trabaja> {
    return this.trabajaService.findOne(+idPersonaOpe, +idSede);
  }

  @Patch(':idPersonaOpe/:idSede')
  update(
    @Param('idPersonaOpe') idPersonaOpe: string,
    @Param('idSede') idSede: string,
    @Body() updateTrabajaDto: UpdateTrabajaDto,
  ): Promise<Trabaja> {
    return this.trabajaService.update(+idPersonaOpe, +idSede, updateTrabajaDto);
  }

  @Delete(':idPersonaOpe/:idSede')
  remove(
    @Param('idPersonaOpe') idPersonaOpe: string,
    @Param('idSede') idSede: string,
  ): Promise<Trabaja> {
    return this.trabajaService.remove(+idPersonaOpe, +idSede);
  }
}
