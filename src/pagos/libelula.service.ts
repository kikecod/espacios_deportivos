import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface LibelulaRegisterDebtPayload {
  externalId: string;
  amount: number;
  description: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  customer: {
    id: number | string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
}

export interface LibelulaRegisterDebtResponse {
  transactionId: string;
  paymentUrl: string;
  qrSimpleUrl?: string;
  rawResponse: Record<string, unknown>;
}

@Injectable()
export class LibelulaService {
  private readonly logger = new Logger(LibelulaService.name);
  private readonly baseUrl: string;
  private readonly appKey: string;
  private readonly callbackUrl: string;
  private readonly returnUrl: string;
  private readonly defaultCurrency: string;
  private readonly requestTimeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('LIBELULA_BASE_URL')?.trim() ||
      'https://api.libelula.bo';
    this.appKey =
      this.configService.get<string>('LIBELULA_APPKEY')?.trim() ?? '';
    this.callbackUrl =
      this.configService.get<string>('LIBELULA_CALLBACK_URL')?.trim() ?? '';
    this.returnUrl =
      this.configService.get<string>('LIBELULA_RETURN_URL')?.trim() ?? '';
    this.defaultCurrency =
      this.configService.get<string>('LIBELULA_CURRENCY')?.trim() ?? 'BOB';
    this.requestTimeout = Number(
      this.configService.get<string>('LIBELULA_TIMEOUT_MS') ?? '8000',
    );
  }

  async registrarDeuda(
    payload: LibelulaRegisterDebtPayload,
  ): Promise<LibelulaRegisterDebtResponse> {
    this.ensureConfiguration();

    const requestBody = {
      appkey: this.appKey,
      monto: payload.amount,
      moneda: payload.currency ?? this.defaultCurrency,
      descripcion: payload.description,
      referencia: payload.externalId,
      callbackUrl: this.callbackUrl,
      retornoUrl: this.returnUrl,
      metadata: payload.metadata ?? {},
      cliente: {
        idCliente: payload.customer.id,
        nombre: payload.customer.name,
        email: payload.customer.email ?? undefined,
        telefono: payload.customer.phone ?? undefined,
      },
    };

    this.logger.debug(`Registrando deuda en Libelula: ${payload.externalId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl.replace(/\/$/, '')}/rest/deuda/registrar`,
          requestBody,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: this.requestTimeout,
          },
        ),
      );

      const data = response.data ?? {};
      const transactionId =
        (data.transaction_id as string) ||
        (data.id_transaccion as string) ||
        (data.id as string);
      const paymentUrl =
        (data.url_pasarela_pagos as string) ||
        (data.urlPago as string) ||
        (data.payment_url as string);
      const qrSimpleUrl =
        (data.qr_simple_url as string) ||
        (data.qrSimpleUrl as string) ||
        (data.qr_url as string);

      if (!transactionId || !paymentUrl) {
        this.logger.error(
          `La respuesta de Libelula no contiene los campos esperados: ${JSON.stringify(
            data,
          )}`,
        );
        throw new InternalServerErrorException(
          'La pasarela no devolvio informacion valida',
        );
      }

      return {
        transactionId,
        paymentUrl,
        qrSimpleUrl,
        rawResponse: data,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const data = error.response?.data;
        this.logger.error(
          `Error Libelula (${status ?? 'sin status'}): ${
            typeof data === 'string' ? data : JSON.stringify(data)
          }`,
        );
      } else {
        this.logger.error(
          `Error inesperado al registrar deuda: ${(error as Error).message}`,
        );
      }
      throw new InternalServerErrorException(
        'No se pudo registrar la deuda con la pasarela',
      );
    }
  }

  private ensureConfiguration() {
    if (!this.appKey) {
      throw new InternalServerErrorException(
        'LIBELULA_APPKEY no configurado en el servidor',
      );
    }
    if (!this.callbackUrl) {
      throw new InternalServerErrorException(
        'LIBELULA_CALLBACK_URL no configurado en el servidor',
      );
    }
    if (!this.returnUrl) {
      throw new InternalServerErrorException(
        'LIBELULA_RETURN_URL no configurado en el servidor',
      );
    }
  }
}
