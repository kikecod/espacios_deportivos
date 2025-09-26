import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaseAccesoService } from './pase_acceso.service';
import { CreatePaseAccesoDto } from './dto/create-pase_acceso.dto';
import { UpdatePaseAccesoDto } from './dto/update-pase_acceso.dto';

@Controller('pase-acceso')
export class PaseAccesoController {
  constructor(private readonly paseAccesoService: PaseAccesoService) {}

  @Post()
  create(@Body() createPaseAccesoDto: CreatePaseAccesoDto) {
    return this.paseAccesoService.create(createPaseAccesoDto);
  }

  @Get()
  findAll() {
    return this.paseAccesoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paseAccesoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaseAccesoDto: UpdatePaseAccesoDto) {
    return this.paseAccesoService.update(+id, updatePaseAccesoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paseAccesoService.remove(+id);
  }
}
