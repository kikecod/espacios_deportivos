import { Controller, Get, Query, Res, Param, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * 📊 Descargar reporte completo del dashboard en CSV
   * GET /api/reportes/dashboard/csv?idDuenio=1&idCancha=5&idSede=2
   */
  @Get('dashboard/csv')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async descargarDashboardCSV(
    @Res() res: Response,
    @Query('idDuenio') idDuenio?: number,
    @Query('idCancha') idCancha?: number,
    @Query('idSede') idSede?: number,
  ) {
    const csv = await this.reportesService.generarDashboardCSV(
      idDuenio,
      idCancha,
      idSede,
    );

    const filename = `dashboard_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf-8'));

    return res.send('\ufeff' + csv); // BOM para UTF-8 en Excel
  }

  /**
   * 💰 Descargar reporte de ingresos mensuales en CSV
   * GET /api/reportes/ingresos/csv?limite=12&idDuenio=1
   */
  @Get('ingresos/csv')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async descargarIngresosCSV(
    @Res() res: Response,
    @Query('limite') limite?: number,
    @Query('idDuenio') idDuenio?: number,
    @Query('idCancha') idCancha?: number,
    @Query('idSede') idSede?: number,
  ) {
    const limiteNumerico = limite ? parseInt(limite.toString()) : 12;

    const csv = await this.reportesService.generarIngresosCSV(
      idDuenio,
      idCancha,
      idSede,
      limiteNumerico,
    );

    const filename = `ingresos_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf-8'));

    return res.send('\ufeff' + csv);
  }

  /**
   * 📊 Descargar estadísticas de una cancha específica en CSV
   * GET /api/reportes/cancha/:id/csv?mes=2024-10
   */
  @Get('cancha/:id/csv')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async descargarEstadisticasCanchaCSV(
    @Res() res: Response,
    @Param('id', ParseIntPipe) idCancha: number,
    @Query('mes') mes?: string,
  ) {
    const csv = await this.reportesService.generarEstadisticasCanchaCSV(
      idCancha,
      mes,
    );

    const filename = `cancha_${idCancha}_${mes || 'actual'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf-8'));

    return res.send('\ufeff' + csv);
  }

  /**
   * 📋 Descargar reporte consolidado completo en CSV
   * GET /api/reportes/consolidado/csv?idDuenio=1&idSede=2
   */
  @Get('consolidado/csv')
  @Auth([TipoRol.ADMIN, TipoRol.DUENIO])
  async descargarReporteConsolidadoCSV(
    @Res() res: Response,
    @Query('idDuenio') idDuenio?: number,
    @Query('idCancha') idCancha?: number,
    @Query('idSede') idSede?: number,
  ) {
    const csv = await this.reportesService.generarReporteConsolidadoCSV(
      idDuenio,
      idCancha,
      idSede,
    );

    const filename = `consolidado_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf-8'));

    return res.send('\ufeff' + csv);
  }
}
