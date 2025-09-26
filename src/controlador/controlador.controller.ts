import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ControladorService } from './controlador.service';
import { CreateControladorDto } from './dto/create-controlador.dto';
import { UpdateControladorDto } from './dto/update-controlador.dto';

@Controller('controlador')
export class ControladorController {
  constructor(private readonly controladorService: ControladorService) {}

  @Post()
  create(@Body() createControladorDto: CreateControladorDto) {
    return this.controladorService.create(createControladorDto);
  }

  @Get()
  findAll() {
    return this.controladorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controladorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateControladorDto: UpdateControladorDto) {
    return this.controladorService.update(+id, updateControladorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.controladorService.remove(+id);
  }
}
