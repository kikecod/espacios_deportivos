import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';

@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post()
  create(@Body() createTransaccioneDto: CreateTransaccioneDto) {
    return this.transaccionesService.create(createTransaccioneDto);
  }

  @Get()
  findAll() {
    return this.transaccionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaccionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransaccioneDto: UpdateTransaccioneDto) {
    return this.transaccionesService.update(+id, updateTransaccioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaccionesService.remove(+id);
  }
  
  @Post('simular/:id')
  async simularPago(@Param('id', ParseIntPipe) id: number) {
    return this.transaccionesService.simularPagoExitoso(id);
  }
}
