import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';

@ApiTags('disciplina')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disciplina')
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  @Roles(TipoRol.ADMIN)
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

  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisciplinaDto: UpdateDisciplinaDto) {
    return this.disciplinaService.update(+id, updateDisciplinaDto);
  }

  @Roles(TipoRol.ADMIN)
  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.disciplinaService.restore(+id);
  }

  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disciplinaService.remove(+id);
  }
}
