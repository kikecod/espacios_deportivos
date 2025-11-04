import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * 📊 GET /api/analytics/dashboard
   * Dashboard principal con todas las métricas
   * @param idDuenio - Filtrar por dueño (opcional)
   * @param idCancha - Filtrar por cancha específica (opcional)
   * @param idSede - Filtrar por sede (opcional)
   */
  @Get('dashboard')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async getDashboard(
    @Query('idPersonaD') idDuenio?: number,
    @Query('idCancha') idCancha?: number,
    @Query('idSede') idSede?: number,
  ) {
    return this.analyticsService.getDashboard(
      idDuenio ? +idDuenio : undefined,
      idCancha ? +idCancha : undefined,
      idSede ? +idSede : undefined,
    );
  }

  /**
   * 📊 GET /api/analytics/cancha/:id
   * Estadísticas detalladas de una cancha específica
   * @param id - ID de la cancha
   * @param mes - Mes en formato YYYY-MM (opcional, por defecto mes actual)
   */
  @Get('cancha/:id')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async getEstadisticasCancha(
    @Param('id', ParseIntPipe) id: number,
    @Query('mes') mes?: string,
  ) {
    return this.analyticsService.getEstadisticasPorCancha(id, mes);
  }

  /**
   * 💰 GET /api/analytics/ingresos?periodo=mes
   * Obtener ingresos mensuales agrupados (últimos 12 meses)
   * @param periodo - Solo acepta 'mes'
   * @param idDuenio - Filtrar por dueño (opcional)
   * @param idCancha - Filtrar por cancha (opcional)
   * @param idSede - Filtrar por sede (opcional)
   * @param limite - Cantidad de meses (opcional, por defecto 12)
   */
  @Get('ingresos')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async getIngresos(
    @Query('periodo') periodo: 'mes',
    @Query('idPersonaD') idDuenio?: number,
    @Query('idCancha') idCancha?: number,
    @Query('idSede') idSede?: number,
    @Query('limite') limite?: number,
  ) {
    return this.analyticsService.getIngresosMensualesAgrupados(
      idDuenio ? +idDuenio : undefined,
      idCancha ? +idCancha : undefined,
      idSede ? +idSede : undefined,
      limite ? +limite : 12,
    );
  }

  /**
   * 📅 GET /api/analytics/calendario?mes=2024-10
   * Obtener disponibilidad de canchas por día y horario
   * @param mes - Mes en formato YYYY-MM
   * @param idDuenio - Filtrar por dueño (opcional)
   * @param idCancha - Filtrar por cancha específica (opcional)
   * @param idSede - Filtrar por sede (opcional)
   */
  @Get('calendario')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async getCalendario(
    @Query('mes') mes: string,
    @Query('idPersonaD') idDuenio?: number,
    @Query('idCancha') idCancha?: number,
    @Query('idSede') idSede?: number,
  ) {
    return this.analyticsService.getCalendarioDisponibilidad(
      mes,
      idDuenio ? +idDuenio : undefined,
      idCancha ? +idCancha : undefined,
      idSede ? +idSede : undefined,
    );
  }

  /**
   * ⭐ GET /api/analytics/resenas
   * Obtener resumen de reseñas y calificaciones
   * @param idDuenio - Filtrar por dueño (opcional)
   * @param idCancha - Filtrar por cancha específica (opcional)
   * @param idSede - Filtrar por sede (opcional)
   */
  @Get('resenas')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async getResenas(
    @Query('idPersonaD') idDuenio?: number,
    @Query('idCancha') idCancha?: number,
    @Query('idSede') idSede?: number,
  ) {
    return this.analyticsService.getResumenResenas(
      idDuenio ? +idDuenio : undefined,
      idCancha ? +idCancha : undefined,
      idSede ? +idSede : undefined,
    );
  }
}
