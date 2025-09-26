import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DuenioService } from './duenio.service';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';

@Controller('duenio')
export class DuenioController {
  constructor(private readonly duenioService: DuenioService) {}

  @Post()
  create(@Body() createDuenioDto: CreateDuenioDto) {
    return this.duenioService.create(createDuenioDto);
  }

  @Get()
  findAll() {
    return this.duenioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.duenioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDuenioDto: UpdateDuenioDto) {
    return this.duenioService.update(+id, updateDuenioDto);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.duenioService.restore(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.duenioService.remove(+id);
  }
}
