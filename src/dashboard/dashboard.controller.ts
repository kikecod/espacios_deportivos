import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { TipoRol } from 'src/roles/rol.entity';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Auth([TipoRol.ADMIN])
  @Get('estadisticas')
  getEstadisticas() {
    return this.dashboardService.getDashboardStats();
  }

  @Auth([TipoRol.ADMIN])
  @Get('metricas')
  getMetricas() {
    return this.dashboardService.getDashboardStats();
  }
}
