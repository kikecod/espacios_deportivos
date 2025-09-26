import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CancelacionService } from './cancelacion.service';
import { CreateCancelacionDto } from './dto/create-cancelacion.dto';
import { UpdateCancelacionDto } from './dto/update-cancelacion.dto';

@Controller('cancelaciones')
export class CancelacionController {
  constructor(private readonly cancelacionService: CancelacionService) {}

  @Post()
  create(@Body() dto: CreateCancelacionDto) {
    return this.cancelacionService.create(dto);
  }

  @Get()
  findAll() {
    return this.cancelacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cancelacionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCancelacionDto) {
    return this.cancelacionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cancelacionService.remove(id);
  }
}
