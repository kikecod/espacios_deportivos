import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { PasesAccesoService } from 'src/pases_acceso/pases_acceso.service';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import { ReservasService } from 'src/reservas/reservas.service';

@Injectable()
export class MailsService {

  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(PasesAcceso)
    private pasesAccesoRepository: Repository<PasesAcceso>,
    private usuarioService: UsuariosService,
    private mailerService: MailerService,
    private pasesAccesoService: PasesAccesoService,
  ) { }

  /**
   * Envía correo de confirmación de reserva con código QR de acceso
   * Se debe llamar cuando la reserva está en estado "Confirmada"
   */
  async sendMailReservaConfirmada(idReserva: number) {
    // 1. Obtener reserva con sus relaciones
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva },
      relations: ['cliente', 'cliente.persona', 'cancha', 'cancha.sede'],
    });

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    //1.1 Verificar que la reserva esté confirmada
    if (reserva.estado !== 'Confirmada') {
      throw new Error('La reserva no está confirmada');
    }

    // 2. Obtener usuario
    const usuario = await this.usuarioService.findByPersonaId(reserva.cliente.idCliente);
    if (!usuario) {
      throw new Error('Usuario no encontrado para la reserva');
    }

    // 3. Buscar el pase de acceso generado para esta reserva
    const pase = await this.pasesAccesoRepository.findOne({
      where: { idReserva: reserva.idReserva },
      order: { creadoEn: 'DESC' }, // Obtener el más reciente
    });

    if (!pase) {
      throw new Error('Pase de acceso no encontrado para la reserva');
    }

    // 4. Generar imagen QR estilizada
    let qrImageBuffer: Buffer;
    try {
      qrImageBuffer = await this.pasesAccesoService.generarQREstilizado(pase.idPaseAcceso);
    } catch (error) {
      console.error('Error al generar QR estilizado:', error);
      throw new Error('No se pudo generar el código QR');
    }

    // 5. Formatear datos para la plantilla
    const codigoReserva = `ROGU-${reserva.idReserva.toString().padStart(8, '0')}`;
    
    const fechaInicio = new Date(reserva.iniciaEn);
    const fechaReserva = fechaInicio.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const horaInicio = fechaInicio.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const fechaFin = new Date(reserva.terminaEn);
    const horaFin = fechaFin.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // 6. Enviar correo con QR adjunto
    await this.mailerService.sendMail({
      to: usuario.correo,
      subject: `✅ Reserva Confirmada ${codigoReserva} - ROGU`,
      template: './reserva',
      context: {
        usuario: usuario.usuario,
        codigoReserva: codigoReserva,
        canchaNombre: reserva.cancha.nombre,
        sedeNombre: reserva.cancha.sede.nombre,
        fechaReserva: fechaReserva,
        horarioReserva: `${horaInicio} - ${horaFin}`,
        participantes: reserva.cantidadPersonas,
        direccionSede: reserva.cancha.sede.direccion,
        precioReserva: `Bs ${Number(reserva.montoBase).toFixed(2)}`,
        montoExtra: `Bs ${Number(reserva.montoExtra).toFixed(2)}`,
        montoTotal: `Bs ${Number(reserva.montoTotal).toFixed(2)}`,
        metodoPago: "QR Bancario",
      },
      attachments: [
        {
          filename: `QR-${codigoReserva}.png`,
          content: qrImageBuffer,
          cid: 'qrcode', // Content-ID para referenciar en el HTML
          contentType: 'image/png',
        },
      ],
    });

    console.log(`✅ Correo de confirmación enviado a ${usuario.correo} para reserva #${idReserva}`);
  }

  /**
   * Método legacy - mantener por compatibilidad
   * @deprecated Usar sendMailReservaConfirmada en su lugar
   */
  async sendMailReserva(idReserva: number) {
    console.warn('⚠️ sendMailReserva está deprecado. Usa sendMailReservaConfirmada');
    // Por ahora, redirigir al nuevo método si la reserva está confirmada
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva },
    });
    
    if (reserva && reserva.estado === 'Confirmada') {
      return this.sendMailReservaConfirmada(idReserva);
    }
  }

}
