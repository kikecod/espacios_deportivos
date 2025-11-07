import { Injectable } from '@nestjs/common';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Repository } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { PasesAccesoService } from 'src/pases_acceso/pases_acceso.service';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private pasesAccesoService: PasesAccesoService // Inyectar servicio de pases
  ){}

  async create(createTransaccioneDto: CreateTransaccioneDto) {
    const reserva = await this.reservaRepository.findOneBy({ idReserva: createTransaccioneDto.idReserva });
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    const transaccion = this.transaccionRepository.create({
      ...createTransaccioneDto,
      id_Reserva: reserva.idReserva,
    });

    const transaccionGuardada = await this.transaccionRepository.save(transaccion);

    // 🎯 GENERAR PASE DE ACCESO AUTOMÁTICAMENTE si la transacción es exitosa
    if (createTransaccioneDto.estado === 'completada' || createTransaccioneDto.estado === 'exitosa') {
      // Actualizar estado de la reserva a Confirmada
      await this.reservaRepository.update(reserva.idReserva, {
        estado: 'Confirmada'
      });

      // Generar pase de acceso QR
      try {
        const pase = await this.pasesAccesoService.generarPaseParaReserva(reserva);
        console.log(`✅ Pase de acceso generado para reserva #${reserva.idReserva}: QR ${pase.codigoQR}`);
      } catch (error) {
        console.error(`❌ Error al generar pase para reserva #${reserva.idReserva}:`, error);
        // No fallar la transacción si el pase no se genera
      }
    }

    return transaccionGuardada;
  }

  findAll() {
    return this.transaccionRepository.find();
  }

  findOne(id: number) {
    return this.transaccionRepository.findOneBy({ idTransaccion: id });
  }

  update(id: number, updateTransaccioneDto: UpdateTransaccioneDto) {
    return this.transaccionRepository.update(id, updateTransaccioneDto)
  }

  remove(id: number) {
    return this.transaccionRepository.delete(id);
  }
}
