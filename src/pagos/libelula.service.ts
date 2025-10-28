import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    /**
     * Integracion Libelula deshabilitada temporalmente.
     * Mantener registro local para evitar excepciones.
     */
    this.logger.warn(
      `Integracion Libelula deshabilitada. Se devuelve respuesta mock para ${payload.externalId}`,
    );

    return {
      transactionId: `libelula-disabled-${Date.now()}`,
      paymentUrl: '',
      qrSimpleUrl: undefined,
      rawResponse: {
        disabled: true,
        externalId: payload.externalId,
      },
    };

    /* Implementacion original preservada para futura reactivacion.
    this.ensureConfiguration();
    ...
    */
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
