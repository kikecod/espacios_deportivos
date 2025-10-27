import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';
import { TransaccionFactura } from 'src/transacciones/entities/transaccion-factura.entity';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import { RegistrarDeudaDto } from './dto/registrar-deuda.dto';
import { LibelulaService } from './libelula.service';
import { LibelulaCallbackDto } from './dto/libelula-callback.dto';
import QRCode from 'qrcode';

type RegistrarDeudaCommand = RegistrarDeudaDto & {
  clienteId: number;
};

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private readonly libelulaService: LibelulaService,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    private readonly dataSource: DataSource,
  ) {}

  async registrarDeuda(command: RegistrarDeudaCommand) {
    const reserva = await this.reservaRepository.findOne({
      where: { id_reserva: command.reserva_id },
      relations: [
        'cliente',
        'cliente.persona',
        'cancha',
        'cancha.sede',
        'transacciones',
      ],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.id_cliente !== command.clienteId) {
      throw new BadRequestException(
        'No puedes registrar pagos para reservas de otros usuarios',
      );
    }

    if (reserva.estado === 'Cancelada') {
      throw new BadRequestException('La reserva fue cancelada');
    }

    const existingPaidTransaction = reserva.transacciones?.find(
      (trx) => trx.estado_pago === 'PAGADO',
    );
    if (existingPaidTransaction) {
      throw new BadRequestException(
        'La reserva ya cuenta con un pago confirmado',
      );
    }

    const descripcion =
      command.descripcion ||
      `Reserva ${reserva.id_reserva} - ${reserva.cancha?.nombre ?? 'Cancha'}`;

    const respuesta = await this.libelulaService.registrarDeuda({
      externalId: `reserva-${reserva.id_reserva}`,
      amount: Number(reserva.monto_total),
      description: descripcion,
      metadata: {
        reserva_id: reserva.id_reserva,
        cliente_id: reserva.id_cliente,
      },
      customer: {
        id: reserva.cliente?.id_cliente ?? reserva.id_cliente,
        name:
          reserva.cliente?.persona?.nombres ??
          `Cliente ${reserva.id_cliente}`,
        email: reserva.cliente?.persona?.documento_numero ?? undefined,
        phone: reserva.cliente?.persona?.telefono ?? undefined,
      },
    });

    const pendingTransaction =
      reserva.transacciones?.find(
        (trx) => trx.estado_pago !== 'PAGADO',
      ) ?? new Transaccion();

    if (!pendingTransaction.id_transaccion) {
      pendingTransaction.reserva = reserva;
      if (reserva.cliente) {
        pendingTransaction.cliente = reserva.cliente;
      }
    }

    pendingTransaction.id_transaccion_libelula = respuesta.transactionId;
    pendingTransaction.url_pasarela_pagos = respuesta.paymentUrl;
    pendingTransaction.qr_simple_url = respuesta.qrSimpleUrl ?? null;
    pendingTransaction.estado_pago = 'PENDIENTE';
    pendingTransaction.fecha_pago = null;
    pendingTransaction.monto_total = Number(reserva.monto_total);
    pendingTransaction.cliente_id = reserva.id_cliente;
    pendingTransaction.reserva_id = reserva.id_reserva;

    const savedTransaction = await this.transaccionRepository.save(
      pendingTransaction,
    );

    return {
      transaccion: {
        id_transaccion: savedTransaction.id_transaccion,
        id_transaccion_libelula: savedTransaction.id_transaccion_libelula,
        url_pasarela_pagos: savedTransaction.url_pasarela_pagos,
        qr_simple_url: savedTransaction.qr_simple_url,
        estado_pago: savedTransaction.estado_pago,
        monto_total: savedTransaction.monto_total,
      },
      reserva: {
        id_reserva: reserva.id_reserva,
        estado: reserva.estado,
      },
      raw_pasarela: respuesta.rawResponse,
    };
  }

  async manejarPagoExitoso(query: LibelulaCallbackDto) {
    const transactionId = query.transaction_id;

    const updateResult = await this.dataSource.transaction(async (manager) => {
      const transaccion = await manager.findOne(Transaccion, {
        where: { id_transaccion_libelula: transactionId },
        relations: ['reserva', 'reserva.cliente'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!transaccion) {
        this.logger.warn(
          `Callback Libelula recibido para transaccion inexistente: ${transactionId}`,
        );
        return null;
      }

      transaccion.estado_pago = (query.status ?? 'PAGADO').toUpperCase();
      transaccion.fecha_pago = new Date();
      await manager.save(transaccion);

      if (query.invoice_id && query.invoice_url) {
        let factura = await manager.findOne(TransaccionFactura, {
          where: {
            transaccion_id: transaccion.id_transaccion,
            invoice_id: query.invoice_id,
          },
        });

        if (!factura) {
          factura = manager.create(TransaccionFactura, {
            transaccion_id: transaccion.id_transaccion,
            invoice_id: query.invoice_id,
            invoice_url: query.invoice_url,
            payload: {
              transaction_id: transactionId,
              status: query.status,
            },
          });
        } else {
          factura.invoice_url = query.invoice_url;
          factura.payload = {
            ...(factura.payload ?? {}),
            transaction_id: transactionId,
            status: query.status,
          };
        }

        await manager.save(factura);
      }

      const reserva = transaccion.reserva;
      reserva.estado = 'Confirmada';
      await manager.save(reserva);

      let pase = await manager.findOne(PasesAcceso, {
        where: { id_reserva: reserva.id_reserva },
      });

      if (!pase) {
        const qrContent = await this.generarContenidoQR(transaccion);
        const qrDataUrl = await QRCode.toDataURL(qrContent, {
          errorCorrectionLevel: 'M',
        });

        pase = manager.create(PasesAcceso, {
          id_reserva: reserva.id_reserva,
          qr: qrDataUrl,
          cantidad_personas: reserva.cantidad_personas,
        });
      } else {
        pase.cantidad_personas = reserva.cantidad_personas;
      }
      await manager.save(pase);

      return {
        reserva_id: reserva.id_reserva,
        transaccion_id: transaccion.id_transaccion,
        estado_pago: transaccion.estado_pago,
      };
    });

    if (!updateResult) {
      throw new NotFoundException('Transaccion no localizada');
    }

    return updateResult;
  }

  private async generarContenidoQR(transaccion: Transaccion): Promise<string> {
    const payload = {
      reservaId: transaccion.reserva_id,
      transaccion: transaccion.id_transaccion_libelula,
      clienteId: transaccion.cliente_id,
      generadoEn: new Date().toISOString(),
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }
}
