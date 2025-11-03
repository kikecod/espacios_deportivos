import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { CancelReservaDto } from './dto/cancel-reserva.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) { }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO, TipoRol.CLIENTE])
  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @Get()
  findAll() {
    return this.reservasService.findAll();
  }

  @Get('cancha/:idCancha')
  findByCanchaAndDate(
    @Param('idCancha') idCancha: string,
    @Query('fecha') fecha?: string
  ) {
    if (fecha) {
      return this.reservasService.findByCanchaAndDate(+idCancha, fecha);
    }
    return this.reservasService.findByCancha(+idCancha);
  }

  @Get('duenio/:duenioId')
  findByDuenio(@Param('duenioId') duenioId: string) {
    return this.reservasService.findByDuenio(+duenioId);
  }
  
  @Get('usuario/:idUsuario')
  findByUsuario(@Param('idUsuario') idUsuario: string) {
    return this.reservasService.findByUsuario(+idUsuario);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReservaDto: UpdateReservaDto) {
    return this.reservasService.update(+id, updateReservaDto);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id/completar')
  completar(@Param('id') id: string) {
    return this.reservasService.completarReserva(+id);
  }

  @Auth([TipoRol.ADMIN])
  @Post('completar-automaticas')
  completarAutomaticas() {
    return this.reservasService.completarReservasAutomaticas();
  }

  @Post(':id/simular-uso')
  simularUso(@Param('id') id: string) {
    return this.reservasService.simularUsoReserva(+id);
  }

  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE])
  @Delete(':id')
  remove(@Param('id') id: string, @Body() cancelReservaDto?: CancelReservaDto) {
    return this.reservasService.remove(
      +id, 
      cancelReservaDto?.motivo, 
      cancelReservaDto?.canal
    );
  }
}
