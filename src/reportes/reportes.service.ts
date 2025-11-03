import { Injectable } from '@nestjs/common';
import { AnalyticsService } from 'src/analytics/analytics.service';

@Injectable()
export class ReportesService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * 📊 Generar reporte completo del dashboard en CSV
   */
  async generarDashboardCSV(
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ): Promise<string> {
    const dashboard = await this.analyticsService.getDashboard(
      idDuenio,
      idCancha,
      idSede,
    );

    let csv = '';

    // Sección 1: Métricas principales
    csv += 'MÉTRICAS PRINCIPALES\n';
    csv += 'Métrica,Valor Actual,Valor Anterior,Variación %,Tendencia\n';
    csv += `Ingresos del Mes,${dashboard.metricas.ingresosMes.valor},${dashboard.metricas.ingresosMes.mesAnterior},${dashboard.metricas.ingresosMes.variacion},${dashboard.metricas.ingresosMes.tendencia}\n`;
    csv += `Total Reservas,${dashboard.metricas.totalReservas.valor},${dashboard.metricas.totalReservas.mesAnterior},${dashboard.metricas.totalReservas.variacion},${dashboard.metricas.totalReservas.tendencia}\n`;
    csv += `Tasa de Ocupación,${dashboard.metricas.tasaOcupacion.valor}%,,,\n`;
    csv += `Rating Promedio,${dashboard.metricas.ratingPromedio.valor}/5,,,\n`;
    csv += '\n';

    // Sección 2: Ingresos últimos 12 meses
    csv += 'INGRESOS ÚLTIMOS 12 MESES\n';
    csv += 'Mes,Nombre Mes,Ingresos\n';
    dashboard.graficos.ingresosUltimos12Meses.forEach((item) => {
      csv += `${item.mes},${item.nombreMes},${item.ingresos}\n`;
    });
    csv += '\n';

    // Sección 3: Reservas por estado
    csv += 'RESERVAS POR ESTADO\n';
    csv += 'Estado,Cantidad\n';
    dashboard.graficos.reservasPorEstado.forEach((item) => {
      csv += `${item.estado},${item.cantidad}\n`;
    });
    csv += '\n';

    // Sección 4: Reservas por día
    csv += 'RESERVAS POR DÍA\n';
    csv += 'Fecha,Cantidad\n';
    dashboard.graficos.reservasPorDia.forEach((item) => {
      csv += `${item.fecha},${item.cantidad}\n`;
    });
    csv += '\n';

    // Sección 5: Horarios populares
    csv += 'HORARIOS MÁS POPULARES\n';
    csv += 'Hora,Cantidad de Reservas\n';
    dashboard.graficos.horariosPopulares.forEach((item) => {
      csv += `${item.hora},${item.cantidad}\n`;
    });
    csv += '\n';

    // Información del reporte
    csv += `\nReporte generado: ${new Date().toISOString()}\n`;
    csv += `Periodo consultado: ${dashboard.periodo.mesActual}\n`;

    return csv;
  }

  /**
   * 💰 Generar reporte de ingresos mensuales en CSV
   */
  async generarIngresosCSV(
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
    limite: number = 12,
  ): Promise<string> {
    const ingresos = await this.analyticsService.getIngresosMensualesAgrupados(
      idDuenio,
      idCancha,
      idSede,
      limite,
    );

    let csv = 'REPORTE DE INGRESOS MENSUALES\n';
    csv += 'Mes,Ingresos,Transacciones\n';

    ingresos.datos.forEach((item) => {
      csv += `${item.mes},${item.ingresos},${item.transacciones}\n`;
    });

    csv += `\nReporte generado: ${new Date().toISOString()}\n`;
    csv += `Periodo: ${ingresos.periodo}\n`;
    csv += `Registros: ${ingresos.datos.length}\n`;

    return csv;
  }

  /**
   * 📊 Generar reporte de estadísticas por cancha en CSV
   */
  async generarEstadisticasCanchaCSV(
    idCancha: number,
    mes?: string,
  ): Promise<string> {
    const stats = await this.analyticsService.getEstadisticasPorCancha(
      idCancha,
      mes,
    );

    let csv = 'REPORTE DE ESTADÍSTICAS POR CANCHA\n';
    csv += `Cancha: ${stats.cancha.nombre}\n`;
    csv += `Sede: ${stats.cancha.sede.nombre}\n`;
    csv += `Periodo: ${stats.periodo.inicio} al ${stats.periodo.fin}\n`;
    csv += '\n';

    // Métricas principales
    csv += 'MÉTRICAS\n';
    csv += 'Métrica,Valor\n';
    csv += `Total Reservas,${stats.metricas.totalReservas}\n`;
    csv += `Ingresos,${stats.metricas.ingresos}\n`;
    csv += `Tasa de Ocupación,${stats.metricas.tasaOcupacion}%\n`;
    csv += `Rating Promedio,${stats.metricas.rating}/5\n`;
    csv += `Total Calificaciones,${stats.metricas.totalCalificaciones}\n`;
    csv += '\n';

    // Reservas por estado
    csv += 'RESERVAS POR ESTADO\n';
    csv += 'Estado,Cantidad\n';
    stats.reservasPorEstado.forEach((item) => {
      csv += `${item.estado},${item.cantidad}\n`;
    });

    csv += `\nReporte generado: ${new Date().toISOString()}\n`;

    return csv;
  }

  /**
   * 📋 Generar reporte consolidado de todas las métricas
   */
  async generarReporteConsolidadoCSV(
    idDuenio?: number,
    idCancha?: number,
    idSede?: number,
  ): Promise<string> {
    const dashboard = await this.analyticsService.getDashboard(
      idDuenio,
      idCancha,
      idSede,
    );

    const ingresos = await this.analyticsService.getIngresosMensualesAgrupados(
      idDuenio,
      idCancha,
      idSede,
      12,
    );

    let csv = '=== REPORTE CONSOLIDADO DE ANALYTICS ===\n\n';

    // Información general
    csv += 'INFORMACIÓN DEL REPORTE\n';
    csv += `Fecha de generación,${new Date().toLocaleString('es-ES')}\n`;
    csv += `Periodo consultado,${dashboard.periodo.mesActual}\n`;
    if (idDuenio) csv += `Filtro Dueño,${idDuenio}\n`;
    if (idCancha) csv += `Filtro Cancha,${idCancha}\n`;
    if (idSede) csv += `Filtro Sede,${idSede}\n`;
    csv += '\n';

    // Métricas principales
    csv += '=== RESUMEN EJECUTIVO ===\n';
    csv += 'Métrica,Valor Actual,Mes Anterior,Variación %,Tendencia\n';
    csv += `Ingresos,${dashboard.metricas.ingresosMes.valor},${dashboard.metricas.ingresosMes.mesAnterior},${dashboard.metricas.ingresosMes.variacion},${dashboard.metricas.ingresosMes.tendencia}\n`;
    csv += `Reservas,${dashboard.metricas.totalReservas.valor},${dashboard.metricas.totalReservas.mesAnterior},${dashboard.metricas.totalReservas.variacion},${dashboard.metricas.totalReservas.tendencia}\n`;
    csv += `Ocupación,${dashboard.metricas.tasaOcupacion.valor}%,,,\n`;
    csv += `Rating,${dashboard.metricas.ratingPromedio.valor}/5,,,\n`;
    csv += '\n';

    // Análisis de ingresos
    csv += '=== ANÁLISIS DE INGRESOS (12 MESES) ===\n';
    csv += 'Mes,Ingresos,Transacciones,Ingreso Promedio\n';
    ingresos.datos.forEach((item) => {
      const promedio = item.transacciones > 0 
        ? (item.ingresos / item.transacciones).toFixed(2) 
        : '0.00';
      csv += `${item.mes},${item.ingresos},${item.transacciones},${promedio}\n`;
    });
    csv += '\n';

    // Distribución de reservas
    csv += '=== DISTRIBUCIÓN DE RESERVAS ===\n';
    csv += 'Estado,Cantidad,Porcentaje\n';
    const totalReservasEstado = dashboard.graficos.reservasPorEstado.reduce(
      (sum, item) => sum + item.cantidad,
      0,
    );
    dashboard.graficos.reservasPorEstado.forEach((item) => {
      const porcentaje =
        totalReservasEstado > 0
          ? ((item.cantidad / totalReservasEstado) * 100).toFixed(2)
          : '0.00';
      csv += `${item.estado},${item.cantidad},${porcentaje}%\n`;
    });
    csv += '\n';

    // Horarios de mayor demanda
    csv += '=== TOP 10 HORARIOS MÁS DEMANDADOS ===\n';
    csv += 'Posición,Hora,Cantidad de Reservas\n';
    dashboard.graficos.horariosPopulares.forEach((item, index) => {
      csv += `${index + 1},${item.hora},${item.cantidad}\n`;
    });
    csv += '\n';

    // Tendencias diarias
    csv += '=== RESERVAS DIARIAS DEL MES ===\n';
    csv += 'Fecha,Cantidad\n';
    dashboard.graficos.reservasPorDia.forEach((item) => {
      csv += `${item.fecha},${item.cantidad}\n`;
    });

    return csv;
  }
}
