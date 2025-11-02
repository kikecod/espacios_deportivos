import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { SedeService } from 'src/sede/sede.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';


@Controller('cancha')
export class CanchaController {
  constructor(
    private readonly canchaService: CanchaService,
  ) {}

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Post()
  create(@Body() createCanchaDto: CreateCanchaDto) {
    return this.canchaService.create(createCanchaDto);
  }

  @Get()
  findAll() {
    return this.canchaService.findAll();
  }

  @Get('busqueda')
  buscar(
    @Query('ubicacion') ubicacion?: string,
    @Query('fecha') fecha?: string,
    @Query('hora') hora?: string,
    @Query('deporte') deporte?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.canchaService.busqueda({
      ubicacion,
      fecha,
      hora,
      deporte,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.canchaService.findOne(+id);
  }

  @Get(':id/disponibilidad')
  obtenerDisponibilidad(
    @Param('id') id: string,
    @Query('fecha') fecha: string,
  ) {
    return this.canchaService.obtenerDisponibilidad(+id, fecha);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCanchaDto: UpdateCanchaDto) {
    return this.canchaService.update(+id, updateCanchaDto);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.canchaService.restore(+id);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.canchaService.remove(+id);
  }
}
