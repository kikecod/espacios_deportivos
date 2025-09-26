import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CalificaCanchaService } from './califica_cancha.service';
import { CreateCalificaCanchaDto } from './dto/create-califica_cancha.dto';
import { UpdateCalificaCanchaDto } from './dto/update-califica_cancha.dto';

@Controller('califica-cancha')
export class CalificaCanchaController {
  constructor(private readonly calificaCanchaService: CalificaCanchaService) {}

  @Post()
  create(@Body() createCalificaCanchaDto: CreateCalificaCanchaDto) {
    return this.calificaCanchaService.create(createCalificaCanchaDto);
  }

  @Get()
  findAll() {
    return this.calificaCanchaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calificaCanchaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalificaCanchaDto: UpdateCalificaCanchaDto) {
    return this.calificaCanchaService.update(+id, updateCalificaCanchaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calificaCanchaService.remove(+id);
  }
}
