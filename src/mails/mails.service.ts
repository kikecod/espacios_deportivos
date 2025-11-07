import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { console } from 'inspector';
import { TransaccionesService } from 'src/transacciones/transacciones.service';

@Injectable()
export class MailsService {

  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private usuarioService: UsuariosService,
    private mailerService: MailerService,
  ) { }

  async sendMail(createMailDto: CreateMailDto) {
    await this.mailerService.sendMail({
      to: "",
      subject: 'Bienvenido a ROGU - Tu Plataforma de Espacios Deportivos',
      template: './reserva', // nombre del archivo de plantilla sin la extensión
      context: {

      }
    })
  }

  async sendMailReserva(idReserva: number) {
    const reserva = await this.reservaRepository.findOne({
      where: { idReserva },
      relations: ['cliente', 'cancha', 'cancha.sede'],
    });

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    const usuario = await this.usuarioService.findByPersonaId(reserva.cliente.idCliente);
    if (!usuario) {
      throw new Error('Usuario no encontrado para la reserva');
    }

    console.log(reserva.cancha.nombre),
    console.log(reserva.cancha.sede.nombre),
    console.log(reserva.cancha.sede.direccion),
    
    await this.mailerService.sendMail({
      to: usuario.correo,
      subject: `Confirmación de Reserva ROGU-${reserva.idReserva.toString().padStart(8, '0')} - ROGU`,
      template: './reserva', // nombre del archivo de plantilla sin la extensión
      context: {
        usuario: usuario.usuario,
        codigoReserva: `ROGU-${reserva.idReserva.toString().padStart(8, '0')}`,
        canchaNombre: reserva.cancha.nombre,
        sedeNombre: reserva.cancha.sede.nombre,
        fechaReserva: reserva.iniciaEn.toISOString().substring(0, 10), 
        horarioReserva: `${reserva.iniciaEn.toISOString().substring(11, 16)} - ${reserva.terminaEn.toISOString().substring(11, 16)}`,
        participantes: reserva.cantidadPersonas,
        direccionSede: reserva.cancha.sede.direccion,
        precioReserva: reserva.montoBase,
        montoExtra: reserva.montoExtra,
        montoTotal: reserva.montoTotal,
        metodoPago: "QR" // Aquí ajustar sacando de transaccion  
      }
    })
  }

}
