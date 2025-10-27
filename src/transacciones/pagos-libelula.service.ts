import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

interface LibelulaRegistrarResponse {
  [key: string]: unknown;
}

@Injectable()
export class PagosLibelulaService {
  private baseUrl = process.env.LIBELULA_BASE_URL || 'https://api.libelula.bo';
  private appKey = process.env.APPKEY || process.env.LIBELULA_APPKEY;
  private callbackUrl = process.env.CALLBACK_URL; // e.g., https://<dominio>/api/pago-exitoso
  private returnUrl = process.env.URL_RETORNO; // e.g., https://<dominio>/checkout/success

  async registrarDeuda(payload: {
    reserva_id: number;
    cliente_id: number;
    monto_total: number;
    descripcion?: string;
  }): Promise<{
    id_transaccion_libelula: string;
    url_pasarela_pagos: string;
    qr_simple_url: string | null;
    raw: LibelulaRegistrarResponse;
  }> {
    if (!this.appKey) {
      throw new InternalServerErrorException('Falta APPKEY de Libelula en variables de entorno');
    }
    if (!this.callbackUrl) {
      throw new InternalServerErrorException('Falta CALLBACK_URL en variables de entorno');
    }
    // URL de retorno opcional: si Libelula lo soporta, se envia; si no, solo usamos callback

    const registrarUrl = `${this.baseUrl.replace(/\/$/, '')}/rest/deuda/registrar`;

    // Construir payload segun especificacion de Libelula.
    // Nota: Debido a falta de contrato detallado en este contexto, enviamos campos tipicos.
    const body = {
      monto: Number(payload.monto_total),
      moneda: 'BOB',
      descripcion: payload.descripcion ?? `Reserva ${payload.reserva_id}`,
      external_id: `${payload.reserva_id}`,
      callback_url: this.callbackUrl,
      return_url: this.returnUrl,
      cliente_id: payload.cliente_id,
    };

    const headers = {
      'Content-Type': 'application/json',
      'AppKey': this.appKey,
    } as Record<string, string>;

    const { data } = await axios.post<LibelulaRegistrarResponse>(registrarUrl, body, { headers });

    // Mapear campos esperados para persistencia
    const id_transaccion_libelula =
      (data as any).id_transaccion_libelula ||
      (data as any).transaction_id ||
      (data as any).idTransaccion ||
      (data as any).id ||
      '';

    const url_pasarela_pagos =
      (data as any).url_pasarela_pagos ||
      (data as any).payment_url ||
      (data as any).urlPago ||
      '';

    const qr_simple_url =
      (data as any).qr_simple_url ||
      (data as any).qr_url ||
      (data as any).qrSimpleUrl ||
      null;

    if (!id_transaccion_libelula || !url_pasarela_pagos) {
      throw new InternalServerErrorException('Respuesta inesperada de Libelula al registrar deuda');
    }

    return { id_transaccion_libelula, url_pasarela_pagos, qr_simple_url, raw: data };
  }
}
