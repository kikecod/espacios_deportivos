import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PasesAccesoService } from './pases_acceso.service';
import { CreatePasesAccesoDto } from './dto/create-pases_acceso.dto';
import { UpdatePasesAccesoDto } from './dto/update-pases_acceso.dto';

@Controller('pases-acceso')
export class PasesAccesoController {
  constructor(private readonly pasesAccesoService: PasesAccesoService) {}

  @Post()
  create(@Body() createPasesAccesoDto: CreatePasesAccesoDto) {
    return this.pasesAccesoService.create(createPasesAccesoDto);
  }

  @Get()
  findAll() {
    return this.pasesAccesoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pasesAccesoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePasesAccesoDto: UpdatePasesAccesoDto) {
    return this.pasesAccesoService.update(+id, updatePasesAccesoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pasesAccesoService.remove(+id);
  }
}
