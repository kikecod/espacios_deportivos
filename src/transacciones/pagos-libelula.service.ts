import { Injectable } from '@nestjs/common';

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
    /**
     * Integracion Libelula deshabilitada: devolver mock para evitar errores en ambientes locales.
     */
    return {
      id_transaccion_libelula: `libelula-disabled-${Date.now()}`,
      url_pasarela_pagos: '',
      qr_simple_url: null,
      raw: {
        disabled: true,
        reserva_id: payload.reserva_id,
        cliente_id: payload.cliente_id,
        monto_total: payload.monto_total,
      },
    };
  }
}
