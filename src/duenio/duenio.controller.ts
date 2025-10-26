import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DuenioService } from './duenio.service';
import { CreateDuenioDto } from './dto/create-duenio.dto';
import { UpdateDuenioDto } from './dto/update-duenio.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('duenio')
export class DuenioController {
  constructor(private readonly duenioService: DuenioService) {}

  @Post()
  @Auth([TipoRol.ADMIN, TipoRol.CLIENTE])
  create(@Body() createDuenioDto: CreateDuenioDto) {
    return this.duenioService.create(createDuenioDto);
  }

  @Get()
  @Auth([TipoRol.ADMIN])
  findAll() {
    return this.duenioService.findAll();
  }

  @Get(':id')
  @Auth([TipoRol.ADMIN])
  findOne(@Param('id') id: string) {
    return this.duenioService.findOne(+id);
  }

  @Patch(':id')
  @Auth([TipoRol.ADMIN])
  update(@Param('id') id: string, @Body() updateDuenioDto: UpdateDuenioDto) {
    return this.duenioService.update(+id, updateDuenioDto);
  }

  @Patch('restore/:id')
  @Auth([TipoRol.ADMIN])
  restore(@Param('id') id: string) {
    return this.duenioService.restore(+id);
  }

  @Delete(':id')
  @Auth([TipoRol.ADMIN])
  remove(@Param('id') id: string) {
    return this.duenioService.remove(+id);
  }
}
