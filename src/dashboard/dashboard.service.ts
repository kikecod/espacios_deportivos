import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sede } from 'src/sede/entities/sede.entity';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Repository, Between, Not, In, IsNull } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(Cancha)
    private readonly canchaRepository: Repository<Cancha>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async getDashboardStats() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const tomorrow = new Date(hoy);
    tomorrow.setDate(hoy.getDate() + 1);

    const [
      totalSedes,
      sedesActivas,
      sedesVerificadas,
      totalCanchas,
      totalReservas,
      totalUsuarios,
    ] = await Promise.all([
      this.sedeRepository.count({ where: { eliminadoEn: IsNull() } }),
      this.sedeRepository.count({ where: { eliminadoEn: IsNull(), inactivo: false } }),
      this.sedeRepository.count({ where: { eliminadoEn: IsNull(), verificada: true } }),
      this.canchaRepository.count({ where: { eliminadoEn: IsNull() } }),
      this.reservaRepository.count({ where: { eliminadoEn: IsNull() } }),
      this.usuarioRepository.count(),
    ]);

    const reservasHoy = await this.reservaRepository.count({
      where: {
        eliminadoEn: IsNull(),
        iniciaEn: Between(hoy, tomorrow),
      },
    });

    const nuevosUsuariosHoy = await this.usuarioRepository.count({
      where: {
        creadoEn: Between(hoy, tomorrow),
      },
    });

    const reservasPendientes = await this.reservaRepository.count({
      where: {
        eliminadoEn: IsNull(),
        estado: Not(In(['COMPLETADA', 'CANCELADA'])),
      },
    });

    const ingresosHoyResult = await this.reservaRepository
      .createQueryBuilder('reserva')
      .select('SUM(reserva.montoTotal)', 'sum')
      .where('reserva.eliminadoEn IS NULL')
      .andWhere('reserva.iniciaEn >= :start', { start: hoy.toISOString() })
      .andWhere('reserva.iniciaEn < :end', { end: tomorrow.toISOString() })
      .getRawOne();

    const ingresosHoy = Number(ingresosHoyResult?.sum ?? 0);

    const canchasActivas = totalCanchas;
    const ocupacion =
      canchasActivas > 0 ? Math.min(Math.round((reservasHoy / canchasActivas) * 100), 100) : 0;

    return {
      sedes: {
        total: totalSedes,
        activas: sedesActivas,
        verificadas: sedesVerificadas,
      },
      canchas: {
        total: totalCanchas,
        activas: canchasActivas,
      },
      usuarios: {
        total: totalUsuarios,
        nuevosHoy: nuevosUsuariosHoy,
      },
      reservas: {
        total: totalReservas,
        hoy: reservasHoy,
        pendientes: reservasPendientes,
        ingresosHoy,
        ocupacion,
      },
    };
  }
}
