import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('disciplina')
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  @Auth([TipoRol.ADMIN])
  @Post()
  create(@Body() createDisciplinaDto: CreateDisciplinaDto) {
    return this.disciplinaService.create(createDisciplinaDto);
  }

  @Get()
  findAll() {
    return this.disciplinaService.findAll();
  }

  /**
   * BÚSQUEDA DE DISCIPLINAS POR NOMBRE
   * Autocompletado de disciplinas
   */
  @Get('search')
  async searchDisciplinasByName(@Query('q') query: string) {
    return this.disciplinaService.searchDisciplinasByName(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disciplinaService.findOne(+id);
  }

  @Auth([TipoRol.ADMIN])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisciplinaDto: UpdateDisciplinaDto) {
    return this.disciplinaService.update(+id, updateDisciplinaDto);
  }

  @Auth([TipoRol.ADMIN])
  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.disciplinaService.restore(+id);
  }

  @Auth([TipoRol.ADMIN])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disciplinaService.remove(+id);
  }
}
