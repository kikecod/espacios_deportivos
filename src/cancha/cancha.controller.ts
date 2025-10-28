import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CanchaService } from './cancha.service';
import { CreateCanchaDto } from './dto/create-cancha.dto';
import { UpdateCanchaDto } from './dto/update-cancha.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('cancha')
export class CanchaController {
  constructor(private readonly canchaService: CanchaService) {}

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Post()
  create(@Body() createCanchaDto: CreateCanchaDto) {
    return this.canchaService.create(createCanchaDto);
  }

  @Get()
  findAll() {
    return this.canchaService.findAll();
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get('sede/:id_sede')
  findBySede(@Param('id_sede') id_sede: string) {
    return this.canchaService.findBySede(+id_sede);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.canchaService.findOne(+id);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCanchaDto: UpdateCanchaDto) {
    return this.canchaService.update(+id, updateCanchaDto);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.canchaService.restore(+id);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.canchaService.remove(+id);
  }
}
