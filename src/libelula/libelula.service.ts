import { Injectable, Logger } from '@nestjs/common';
import { CreateLibelulaDto } from './dto/create-libelula.dto';
import { UpdateLibelulaDto } from './dto/update-libelula.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RegistrarDeudaDto } from './dto/registrar-deuda.dto';
import { RegistrarDeudaResponse } from './interfaces/registrar-deuda-response.interface';
import { firstValueFrom } from 'rxjs';
import { TransaccionesService } from '../transacciones/transacciones.service';
import { CreateTransaccioneDto } from 'src/transacciones/dto/create-transaccione.dto';
import { CallbackDto } from './dto/callback.dto';
import { ReservasService } from 'src/reservas/reservas.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { In, Repository } from 'typeorm';
import { PasesAccesoService } from 'src/pases_acceso/pases_acceso.service';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import { MailsService } from 'src/mails/mails.service';

@Injectable()
export class LibelulaService {

  private readonly logger = new Logger(LibelulaService.name);
  private readonly baseUrl: string;
  private readonly appKey: string;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly transaccionesService: TransaccionesService,
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private readonly pasesAccesoService: PasesAccesoService,
    private readonly mailsService: MailsService,

  ){
    this.baseUrl = this.config.get<string>('LIBELULA_BASE_URL', 'https://api.libelula.bo');
    this.appKey = this.config.get<string>('LIBELULA_APP_KEY', '');
    
  }
  async registrarDeuda(Deudadto: RegistrarDeudaDto): Promise<RegistrarDeudaResponse> {

    const payload = {
      ...Deudadto,
      appkey: this.appKey,
      callback_url: this.config.get<string>('LIBELULA_CALLBACK_URL'),
      url_retorno: this.config.get<string>('LIBELULA_RETURN_URL'),
    };
  
    

    const { data } = await firstValueFrom(
      this.http.post<RegistrarDeudaResponse>(
        `${this.baseUrl}/rest/deuda/registrar`,
        payload,
      ),
    );

    if (data.error) {
      this.logger.error(`Error registrando deuda: ${data.mensaje}`);
      throw new Error(data.mensaje || 'Error registrado deuda en Libelula');
    }

    // Calcular monto total de la deuda
    const monto = (Deudadto.lineas_detalle_deuda ?? [])
    .reduce((acc, d) => acc + d.cantidad * d.costo_unitario, 0);

    // Guardar transacción pendiente
    const idTransaccion = data.id_transaccion;
    if (!idTransaccion) {
      this.logger.error('Libelula response missing id_transaccion');
      throw new Error('Libelula response missing id_transaccion');
    }

    await this.transaccionesService.create({
      idReserva: Number(Deudadto.idReserva),
      pasarela: 'Libelula',
      metodo: 'libelula_payment',
      monto: monto,
      estado: 'pendiente',
      idExterno: idTransaccion,
      codigoAutorizacion: Deudadto.identificador_deuda,
      comisionPasarela: 0,
      comisionPlataforma: 0,
      monedaLiquidada: 'BOB',
    });

    return data;
  }
  async consultarPagos( fechaInicial: string, fechaFinal: string) {
    const payload = {
      appkey: this.appKey,
      fecha_inicial: fechaInicial,
      fecha_final: fechaFinal,
    };
    const { data } = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/rest/pago/consultar_pagos`,
        payload,
      )
    );
     return data;
  }
  async consultarDeudasPorFechas(params: {
    fecha_inicial: string;
    fecha_final: string;
    numero_documento?: string;
    complemento_documento?: string;
    codigo_tipo_documento?: string;
  }) {
    const { data } = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/rest/deuda/consultar_deudas/por_fechas`,
        { appKey: this.appKey, ...params },
      ),
    );
    return data;
  }
  async consultarDeudaPorIdentificador(params: {
    identificador?: string;
    codigo_recaudacion?: string;
  }){
    const { data } = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/rest/deuda/consultar_deudas/por_identificador`,
      { appkey: this.appKey, ...params },
      ),
    );
    return data;
  }
  async procesarCallback({ transactionId, invoiceId, invoiceUrl }: CallbackDto) {
    this.logger.log(`CALLBACK RECIBIDO: ${JSON.stringify({ transactionId, invoiceId, invoiceUrl })}`);

    if (!transactionId) {
      return { ok: false, error: "transaction_id no enviado por Libélula" };
    }

    // 1️⃣ Buscar transacción pendiente en BD
    const transaccion = await this.transaccionesService.findByIdCodigoAutorizacion(transactionId);

    this.logger.log(`Transacción encontrada en BD: ${JSON.stringify(transaccion)}`);

    if (!transaccion) {
      return { ok: false, error: "Transacción no encontrada en BD" };
    }

    // 2️⃣ Consultar estado real en Libélula
    const detalle = await this.consultarDeudaPorIdentificador({
      identificador: transaccion.codigoAutorizacion,
    });

    // 3️⃣ Actualizar transacción a completado
    await this.transaccionesService.update(transaccion.idTransaccion, {
      estado: 'completado',
      comisionPasarela: detalle.comision_pasarela ?? 0,
      comisionPlataforma: detalle.comision_plataforma ?? 0,
      monedaLiquidada: detalle.moneda ?? 'BOB',
      codigoAutorizacion: detalle.codigo_autorizacion,
      capturadoEn: new Date(),
    });

    // 4️⃣ Confirmar reserva asociada
    await this.reservaRepository.update(transaccion.id_Reserva, {
      estado: 'Confirmada',
    });

    // Buscamos la reserva y le pasamos
    const reserva = await this.reservaRepository.findOneBy({
      idReserva: transaccion.id_Reserva,
    });

    if (!reserva) {
      this.logger.error(`Reserva no encontrada para la transacción ID: ${transaccion.id_Reserva}`);
      return { ok: false, error: 'Reserva no encontrada' };
    }

    // 5️⃣ Crear Pase de Acceso
    await this.pasesAccesoService.generarPaseParaReserva(reserva);

    // 6️⃣ Enviar correo de confirmación
    await this.mailsService.sendMailReservaConfirmada(reserva.idReserva);

    return {
      ok: true,
      message: 'Pago completado',
      invoiceId,
      invoiceUrl,
    };
  }
}

