import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransaccioneDto } from './dto/create-transaccione.dto';
import { UpdateTransaccioneDto } from './dto/update-transaccione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Repository } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { PasesAccesoService } from 'src/pases_acceso/pases_acceso.service';
import { MailsService } from 'src/mails/mails.service';
import { WebsocketGateway } from 'src/websocket/websocket/websocket.gateway';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private pasesAccesoService: PasesAccesoService, // Inyectar servicio de pases
    private mailsService: MailsService, // Inyectar servicio de correos
    private eventsGateway: WebsocketGateway,
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
    return transaccionGuardada;
  }
  findByIdCodigoAutorizacion(codigoAutorizacion: string) {
    return this.transaccionRepository.findOne({ where: { codigoAutorizacion } });
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
  
  async simularPagoExitoso(idTransaccion: number) {
    // 1️⃣ Buscar transacción pendiente en BD
    const transaccion = await this.transaccionRepository.findOneBy({ idTransaccion });

    if (!transaccion) {
      throw new NotFoundException(`Transacción con ID ${idTransaccion} no encontrada`);
    }

    if (transaccion.estado === 'completado') {
        return { message: 'La transacción ya estaba pagada anteriormente.' };
    }

    // 2️⃣ (SALTADO) No consultamos a Libélula, asumimos éxito.
    // Creamos datos simulados de respuesta bancaria
    const datosSimulados = {
        comision_pasarela: 0, // En simulación no hay cobro real
        comision_plataforma: 0,
        moneda: 'BOB',
        codigo_autorizacion: `SIM-${Date.now()}`, // Generamos un código falso
    };

    // 3️⃣ Actualizar transacción a completado
    // Nota: Usamos Date() directamente, asegúrate que coincida con tu columna entity
    await this.transaccionRepository.update(transaccion.idTransaccion, {
      estado: 'completado',
      comisionPasarela: datosSimulados.comision_pasarela,
      comisionPlataforma: datosSimulados.comision_plataforma,
      monedaLiquidada: datosSimulados.moneda,
      codigoAutorizacion: datosSimulados.codigo_autorizacion,
      capturadoEn: new Date(),
    });

    // 4️⃣ Confirmar reserva asociada
    // Primero verificamos que exista la reserva
    const reserva = await this.reservaRepository.findOneBy({
      idReserva: transaccion.id_Reserva,
    });

    if (!reserva) {
       throw new NotFoundException('Reserva asociada no encontrada');
    }

    await this.reservaRepository.update(reserva.idReserva, {
      estado: 'Confirmada',
    });

    // 5️⃣ Crear Pase de Acceso
    // Pasamos el objeto reserva actualizado (aunque para generar pase usualmente basta con el ID y datos base)
    await this.pasesAccesoService.generarPaseParaReserva(reserva);

    // 6️⃣ Notificar vía WebSocket
    // Aquí el frontend recibirá la señal de que todo salió bien sin recargar la página
    if (this.eventsGateway) {
        this.eventsGateway.notificarPagoCompletado(transaccion.idExterno || transaccion.idTransaccion.toString(), {
            reservaId: reserva.idReserva,
            mensaje: 'Pago SIMULADO completado exitosamente',
            estado: 'completado'
        });
    }

    // 7️⃣ Enviar correo de confirmación
    // Envolvemos en try-catch para que si falla el correo, no falle toda la simulación
    try {
        await this.mailsService.sendMailReservaConfirmada(reserva.idReserva);
    } catch (error) {
        console.error("Error enviando correo en simulación:", error);
    }

    return {
      ok: true,
      message: 'Simulación de pago completada',
      transaccionId: transaccion.idTransaccion,
      reservaId: reserva.idReserva
    };
  }
}
