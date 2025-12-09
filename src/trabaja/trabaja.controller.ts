import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { TrabajaService } from './trabaja.service';
import { CreateTrabajaDto } from './dto/create-trabaja.dto';
import { UpdateTrabajaDto } from './dto/update-trabaja.dto';
import { Trabaja } from './entities/trabaja.entity';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

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

  @Get('me/sedes')
  @Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
  listarSedesMe(@Req() req: any) {
    const idPersonaOpe = req?.user?.idPersona;
    return this.trabajaService.listarSedesAsignadas(idPersonaOpe);
  }

  @Get('me/sedes/:idSede/pases')
  @Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
  listarPasesMe(
    @Req() req: any,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    const idPersonaOpe = req?.user?.idPersona;
    return this.trabajaService.listarPasesPorSede(idPersonaOpe, idSede);
  }

  @Get('controlador/:idPersonaOpe/sedes')
  @Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
  listarSedesControlador(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
  ) {
    return this.trabajaService.listarSedesAsignadas(idPersonaOpe);
  }

  @Get('controlador/:idPersonaOpe/sedes/:idSede/pases')
  @Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
  listarPasesPorSede(
    @Param('idPersonaOpe', ParseIntPipe) idPersonaOpe: number,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    return this.trabajaService.listarPasesPorSede(idPersonaOpe, idSede);
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
