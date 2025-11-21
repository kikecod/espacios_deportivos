import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { LibelulaService } from './libelula.service';
import { CreateLibelulaDto } from './dto/create-libelula.dto';
import { UpdateLibelulaDto } from './dto/update-libelula.dto';
import { RegistrarDeudaDto } from './dto/registrar-deuda.dto';
import { TransaccionesService } from '../transacciones/transacciones.service';
import { ok } from 'assert';
import { CreateTransaccioneDto } from 'src/transacciones/dto/create-transaccione.dto';

@ApiTags('Libelula')
@Controller('libelula')
export class LibelulaController {
  constructor(
    private readonly libelulaService: LibelulaService,
    private readonly transaccionesService: TransaccionesService,
  ) {}

  @ApiOperation({ summary: 'Crear una deuda en Libélula' })
  @ApiResponse({ status: 201, description: 'Deuda registrada correctamente.' })
  @ApiResponse({ status: 400, description: 'Error en la solicitud o en Libélula.' })
  @Post ('crear-deuda')
  async crearDeuda(@Body() body: RegistrarDeudaDto) {
    const res = await this.libelulaService.registrarDeuda(body);

    return {
      pasarelaUrl: res.url_pasarela_pagos,
      transaccionId: res.id_transaccion,
      qrSimpleUrl: res.qr_simple_url,
      mensaje: res.mensaje,
    }
  }
  @ApiOperation({ summary: 'Callback de Libélula para confirmar un pago' })
  @ApiQuery({ name: 'transaction_id', required: true })
  @ApiQuery({ name: 'invoice_id', required: false })
  @ApiQuery({ name: 'invoice_url', required: false })
  @ApiResponse({ status: 200, description: 'Callback procesado correctamente.' })
  @Get('callback')
  async callback(
    @Query('transaction_id') transactionId: string,
    @Query('invoice_id') invoiceId?: string,
    @Query('invoice_url') invoiceUrl?: string,
  ) {
    return this.libelulaService.procesarCallback({
      transactionId,
      invoiceId,
      invoiceUrl,
    });
  }
}
