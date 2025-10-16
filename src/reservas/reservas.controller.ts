import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) { }

  // CREATE - Crear nueva reserva
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO, TipoRol.CLIENTE])
  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  // READ - Listar todas las reservas (solo admin)
  @Auth([TipoRol.ADMIN])
  @Get()
  findAll() {
    return this.reservasService.findAll();
  }

  // READ - Obtener reservas de un usuario/cliente específico
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE])
  @Get('usuario/:idCliente')
  findByUsuario(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return this.reservasService.findByUsuario(idCliente);
  }

  // READ - Obtener reservas de una cancha (para dueños)
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get('cancha/:canchaId')
  findByCancha(@Param('canchaId', ParseIntPipe) canchaId: number) {
    return this.reservasService.findByCancha(canchaId);
  }

  // READ - Obtener reservas de un dueño
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get('duenio/:duenioId')
  findByDuenio(@Param('duenioId', ParseIntPipe) duenioId: number) {
    return this.reservasService.findByDuenio(duenioId);
  }

  // READ - Obtener detalle de una reserva específica
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE, TipoRol.DUENIO])
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.findOne(id);
  }

  // UPDATE - Modificar una reserva
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE])
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto
  ) {
    return this.reservasService.update(id, updateReservaDto);
  }

  // CANCEL - Cancelar una reserva
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE])
  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo?: string
  ) {
    return this.reservasService.cancelar(id, motivo);
  }

  // DELETE - Eliminar (soft delete) una reserva
  @Auth([TipoRol.ADMIN])
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.remove(id);
  }
}
