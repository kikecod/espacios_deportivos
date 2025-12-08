import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, } from '@nestjs/common';
import { ParticipaService } from './participa.service';
import { CreateParticipaDto } from './dto/create-participa.dto';
import { UpdateParticipaDto } from './dto/update-participa.dto';

@Controller('participa')
export class ParticipaController {
  constructor(private readonly participaService: ParticipaService) { }

  @Post()
  create(@Body() dto: CreateParticipaDto) {
    return this.participaService.create(dto);
  }

  @Get('reserva/:idReserva')
  findOneByReserva(
    @Param('idReserva', ParseIntPipe) idReserva: number,
  ) {
    return this.participaService.findOneByReserva(idReserva);
  }
  
  @Get(':idReserva/:idCliente')
  findOne(
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
  ) {
    return this.participaService.findOne(idReserva, idCliente);
  }



  @Patch(':idReserva/:idCliente')
  update(
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
    @Body() dto: UpdateParticipaDto,
  ) {
    return this.participaService.update(idReserva, idCliente, dto);
  }

  @Delete(':idReserva/:idCliente')
  remove(
    @Param('idReserva', ParseIntPipe) idReserva: number,
    @Param('idCliente', ParseIntPipe) idCliente: number,
  ) {
    return this.participaService.remove(idReserva, idCliente);
  }
}
