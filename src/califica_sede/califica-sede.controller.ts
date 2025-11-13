import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { CalificaSedeService } from './califica-sede.service';
import { CreateCalificaSedeDto } from './dto/create-califica-sede.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('califica-sede')
export class CalificaSedeController {
  
  constructor(private readonly calificaSedeService: CalificaSedeService) {}

  /**
   * POST /califica-sede
   * Crear una calificación de sede
   * Solo clientes autenticados
   */
  @Auth([TipoRol.CLIENTE])
  @Post()
  async create(
    @ActiveUser() user,
    @Body() createDto: CreateCalificaSedeDto,
  ) {
    const idCliente = user.idPersona; // El ID del cliente desde el token
    return await this.calificaSedeService.create(idCliente, createDto);
  }

  /**
   * GET /califica-sede/sede/:idSede
   * Obtener todas las reseñas de una sede específica
   * Público (no requiere autenticación)
   */
  @Get('sede/:idSede')
  async findBySedeId(@Param('idSede', ParseIntPipe) idSede: number) {
    return await this.calificaSedeService.findBySedeId(idSede);
  }

  /**
   * GET /califica-sede/puede-calificar/:idSede
   * Verificar si el cliente puede calificar una sede
   * Solo clientes autenticados
   */
  @Auth([TipoRol.CLIENTE])
  @Get('puede-calificar/:idSede')
  async puedeCalificar(
    @ActiveUser() user,
    @Param('idSede', ParseIntPipe) idSede: number,
  ) {
    const idCliente = user.idPersona;
    return await this.calificaSedeService.puedeCalificar(idCliente, idSede);
  }
}
