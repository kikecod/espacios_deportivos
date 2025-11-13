import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SedeService } from './sede.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('sede')
export class SedeController {
  constructor(private readonly sedeService: SedeService) {}

  // ============================================
  // ENDPOINTS ADMINISTRATIVOS (CRUD básico)
  // ============================================
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Post()
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedeService.create(createSedeDto);
  }

  
  @Get()
  findAll() {
    return this.sedeService.findAll();
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get('duenio/:idPersonaD')
  findSedeByDuenio(@Param('idPersonaD', ParseIntPipe) idPersonaD: number) {
    return this.sedeService.findSedeByDuenio(idPersonaD);
  }
  

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedeService.update(id, updateSedeDto);
  }

  @Auth([TipoRol.ADMIN])
  @Patch('restore/:id')
  restore(@Param('id') id: string){
    return this.sedeService.restore(+id);
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.remove(id);
  }

  // ============================================
  // ENDPOINTS PÚBLICOS (Sistema de búsqueda)
  // ============================================
  
  /**
   * GET /sedes/:id
   * Obtener detalle completo de una sede (sin canchas)
   * Público - No requiere autenticación
   */
  @Get(':id')
  findOneDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findOneDetalle(id);
  }

  /**
   * GET /sedes/:id/canchas
   * Obtener todas las canchas de una sede
   * Público - No requiere autenticación
   */
  @Get(':id/canchas')
  findCanchasBySede(@Param('id', ParseIntPipe) id: number) {
    return this.sedeService.findCanchasBySede(id);
  }
}
