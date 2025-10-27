import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { CreateBloqueoDto } from './dto/create-bloqueo.dto';
import { BloqueosService } from './bloqueos.service';

type AuthenticatedRequest = Request & { user?: { id_persona?: number } };

@ApiTags('bloqueos')
@Controller('bloqueos')
export class BloqueosController {
  constructor(private readonly service: BloqueosService) {}

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Post()
  async create(@Body() dto: CreateBloqueoDto, @Req() req: AuthenticatedRequest) {
    const duenioId = req.user?.id_persona;
    const result = await this.service.create(dto, duenioId);
    return { message: 'Bloqueo registrado', bloqueo: result };
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Get('cancha/:id')
  async list(@Param('id') id: string) {
    const id_cancha = Number(id);
    const list = await this.service.findByCancha(id_cancha);
    return { bloqueos: list };
  }

  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const duenioId = req.user?.id_persona;
    return this.service.remove(Number(id), duenioId);
  }
}
