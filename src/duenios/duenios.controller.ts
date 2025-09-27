import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DueniosService } from './duenios.service';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';

@Controller('duenios')
export class DueniosController {
  constructor(private readonly dueniosService: DueniosService) {}

  @Post()
  create(@Body() createDuenioDto: CreateDuenioDto) {
    return this.dueniosService.create(createDuenioDto);
  }

  @Get()
  findAll() {
    return this.dueniosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dueniosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDuenioDto: UpdateDuenioDto) {
    return this.dueniosService.update(+id, updateDuenioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dueniosService.remove(+id);
  }
}
