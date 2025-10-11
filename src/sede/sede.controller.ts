import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { SedeService } from './sede.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { TipoRol } from 'src/roles/entities/rol.entity';
import { DuenioOwnerGuard } from 'src/auth/guard/duenio-owner.guard';
import { ListQueryDto } from 'src/common/dto/list-query.dto';

@ApiTags('sede')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sede')
export class SedeController {
  constructor(private readonly sedeService: SedeService) {}

  @UseGuards(DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Post()
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedeService.create(createSedeDto);
  }

  @Get()
  findAll(@Query() query: ListQueryDto) {
    return this.sedeService.findAllPaged(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findOne(id);
  }

  @UseGuards(DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedeService.update(id, updateSedeDto);
  }

  @UseGuards(DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.sedeService.restore(+id);
  }

  @UseGuards(DuenioOwnerGuard)
  @Roles(TipoRol.DUENIO, TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.remove(id);
  }
}
