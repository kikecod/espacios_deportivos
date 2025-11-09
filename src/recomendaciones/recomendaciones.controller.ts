import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { RecomendacionesResponseDto } from './dto';

@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(
    private readonly recomendacionesService: RecomendacionesService,
  ) {}

  /**
   * GET /recomendaciones/espacios/:idUsuario
   * Obtener recomendaciones personalizadas basadas en el historial del usuario
   */
  @Get('espacios/:idUsuario')
  async obtenerRecomendacionesPersonalizadas(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
  ): Promise<RecomendacionesResponseDto> {
    return this.recomendacionesService.obtenerRecomendacionesPersonalizadas(
      idUsuario,
      limite,
    );
  }

  /**
   * GET /recomendaciones/similares/:idCancha
   * Obtener canchas similares a una específica
   */
  @Get('similares/:idCancha')
  async obtenerCanchasSimilares(
    @Param('idCancha', ParseIntPipe) idCancha: number,
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
  ): Promise<RecomendacionesResponseDto> {
    return this.recomendacionesService.obtenerCanchasSimilares(
      idCancha,
      limite,
    );
  }

  /**
   * GET /recomendaciones/populares
   * Obtener canchas más populares y mejor valoradas
   */
  @Get('populares')
  async obtenerCanchasPopulares(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
  ): Promise<RecomendacionesResponseDto> {
    return this.recomendacionesService.obtenerCanchasPopulares(limite);
  }

  /**
   * GET /recomendaciones/explorar/:idUsuario
   * Explorar nuevas opciones que el usuario no ha visitado
   */
  @Get('explorar/:idUsuario')
  async explorarNuevasOpciones(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Query('disciplina') disciplina?: string,
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number = 10,
  ): Promise<RecomendacionesResponseDto> {
    return this.recomendacionesService.explorarNuevasOpciones(
      idUsuario,
      disciplina,
      limite,
    );
  }
}
