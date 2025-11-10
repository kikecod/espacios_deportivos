import { Injectable } from '@nestjs/common';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Repository } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { PasesAccesoService } from 'src/pases_acceso/pases_acceso.service';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private pasesAccesoService: PasesAccesoService, // Inyectar servicio de pases
    private mailsService: MailsService, // Inyectar servicio de correos
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

    // 🎯 FLUJO COMPLETO: Confirmar reserva → Generar QR → Enviar correo
    if (createTransaccioneDto.estado === 'completada' || createTransaccioneDto.estado === 'exitosa') {
      console.log(`🔄 Procesando confirmación de reserva #${reserva.idReserva}...`);
      
      // 1. Actualizar estado de la reserva a Confirmada
      await this.reservaRepository.update(reserva.idReserva, {
        estado: 'Confirmada'
      });
      console.log(`✅ Reserva #${reserva.idReserva} actualizada a estado Confirmada`);

      // 2. Generar pase de acceso QR
      try {
        const pase = await this.pasesAccesoService.generarPaseParaReserva(reserva);
        console.log(`✅ Pase de acceso generado para reserva #${reserva.idReserva}: QR ${pase.codigoQR}`);
        
        // 3. Enviar correo con QR bonito
        try {
          await this.mailsService.sendMailReservaConfirmada(reserva.idReserva);
          console.log(`📧 Correo de confirmación enviado para reserva #${reserva.idReserva}`);
        } catch (mailError) {
          console.error(`❌ Error al enviar correo para reserva #${reserva.idReserva}:`, mailError.message);
          // No fallar la transacción si el correo no se envía
        }
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
