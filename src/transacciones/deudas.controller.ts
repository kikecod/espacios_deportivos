import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  Res,
  Post,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegistrarDeudaDto } from './dto/registrar-deuda.dto';
import { PagosLibelulaService } from './pagos-libelula.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { TransaccionFactura } from './entities/transaccion-factura.entity';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Controller()
export class DeudasController {
  constructor(
    private readonly pagosService: PagosLibelulaService,
    @InjectRepository(Transaccion)
    private readonly transRepo: Repository<Transaccion>,
    @InjectRepository(TransaccionFactura)
    private readonly facturaRepo: Repository<TransaccionFactura>,
    @InjectRepository(PasesAcceso)
    private readonly paseRepo: Repository<PasesAcceso>,
    @InjectRepository(Reserva)
    private readonly reservaRepo: Repository<Reserva>,
  ) {}

  @Post('deudas/registrar')
  async registrarDeuda(@Body() body: RegistrarDeudaDto) {
    const { reserva_id, cliente_id, monto_total, descripcion } = body;
    // Llamar a Libelula
    const registrado = await this.pagosService.registrarDeuda({
      reserva_id,
      cliente_id,
      monto_total,
      descripcion,
    });

    // Guardar transaccion
    const transaccion = this.transRepo.create({
      id_transaccion_libelula: registrado.id_transaccion_libelula,
      url_pasarela_pagos: registrado.url_pasarela_pagos,
      qr_simple_url: registrado.qr_simple_url,
      estado_pago: 'PENDIENTE',
      fecha_pago: null,
      monto_total: Number(monto_total),
      cliente_id: Number(cliente_id),
      reserva_id: Number(reserva_id),
    });
    const saved = await this.transRepo.save(transaccion);

    return {
      message: 'Deuda registrada en Libelula',
      transaccion: saved,
    };
  }

  // Ejemplo de callback: GET /api/pago-exitoso?transaction_id=...&invoice_id=...&invoice_url=...
  @Get('pago-exitoso')
  async pagoExitoso(
    @Query('transaction_id') transactionId: string,
    @Query('invoice_id') invoiceId: string,
    @Query('invoice_url') invoiceUrl: string,
    @Res() res: Response,
  ) {
    if (!transactionId) {
      throw new InternalServerErrorException('transaction_id es requerido');
    }

    const transaccion = await this.transRepo.findOne({
      where: { id_transaccion_libelula: transactionId },
      relations: ['reserva'],
    });

    if (!transaccion) {
      throw new InternalServerErrorException('Transaccion no encontrada');
    }

    // Actualizar estado de pago y fecha
    transaccion.estado_pago = 'PAGADO';
    transaccion.fecha_pago = new Date();
    await this.transRepo.save(transaccion);

    // Guardar informacion de factura (opcional si viene)
    if (invoiceId && invoiceUrl) {
      const factura = this.facturaRepo.create({
        transaccion_id: transaccion.id_transaccion,
        invoice_id: invoiceId,
        invoice_url: invoiceUrl,
        payload: { transaction_id: transactionId },
      });
      await this.facturaRepo.save(factura);
    }

    // Generar Pase de Acceso (QR)
    const reserva = await this.reservaRepo.findOne({
      where: { id_reserva: transaccion.reserva_id },
    });
    if (reserva) {
      const qrPayload = {
        t: 'ROGU-QR',
        r: reserva.id_reserva,
        c: transaccion.cliente_id,
        n: Math.random().toString(36).slice(2),
        iat: Date.now(),
      };
      const qr = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
      await this.paseRepo.save(
        this.paseRepo.create({
          id_reserva: reserva.id_reserva,
          qr,
          cantidad_personas: reserva.cantidad_personas,
        }),
      );
    }

    const returnUrl = process.env.URL_RETORNO || 'http://localhost:5173/checkout/success';
    return res.redirect(returnUrl);
  }
}
