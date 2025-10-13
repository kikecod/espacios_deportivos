import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Auth([TipoRol.ADMIN])
@Controller('disciplina')
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  @Post()
  create(@Body() createDisciplinaDto: CreateDisciplinaDto) {
    return this.disciplinaService.create(createDisciplinaDto);
  }

  @Get()
  findAll() {
    return this.disciplinaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disciplinaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisciplinaDto: UpdateDisciplinaDto) {
    return this.disciplinaService.update(+id, updateDisciplinaDto);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.disciplinaService.restore(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disciplinaService.remove(+id);
  }
}
