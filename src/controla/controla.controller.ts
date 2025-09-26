import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ControlaService } from './controla.service';
import { CreateControlaDto } from './dto/create-controla.dto';
import { UpdateControlaDto } from './dto/update-controla.dto';

@Controller('controla')
export class ControlaController {
  constructor(private readonly controlaService: ControlaService) {}

  @Post()
  create(@Body() createControlaDto: CreateControlaDto) {
    return this.controlaService.create(createControlaDto);
  }

  @Get()
  findAll() {
    return this.controlaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.controlaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateControlaDto: UpdateControlaDto) {
    return this.controlaService.update(+id, updateControlaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.controlaService.remove(+id);
  }
}
