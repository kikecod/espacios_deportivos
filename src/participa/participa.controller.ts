import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ParticipaService } from './participa.service';
import { CreateParticipaDto } from './dto/create-participa.dto';
import { UpdateParticipaDto } from './dto/update-participa.dto';

@Controller('participa')
export class ParticipaController {
  constructor(private readonly participaService: ParticipaService) {}

  @Post()
  create(@Body() dto: CreateParticipaDto) {
    return this.participaService.create(dto);
  }

  @Get(':id_reserva/:id_cliente')
  findOne(
    @Param('id_reserva', ParseIntPipe) id_reserva: number,
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
  ) {
    return this.participaService.findOne(id_reserva, id_cliente);
  }

  @Patch(':id_reserva/:id_cliente')
  update(
    @Param('id_reserva', ParseIntPipe) id_reserva: number,
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
    @Body() dto: UpdateParticipaDto,
  ) {
    return this.participaService.update(id_reserva, id_cliente, dto);
  }

  @Delete(':id_reserva/:id_cliente')
  remove(
    @Param('id_reserva', ParseIntPipe) id_reserva: number,
    @Param('id_cliente', ParseIntPipe) id_cliente: number,
  ) {
    return this.participaService.remove(id_reserva, id_cliente);
  }
}
