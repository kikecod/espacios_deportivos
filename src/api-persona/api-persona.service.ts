import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiPersonaService {
    private readonly logger = new Logger(ApiPersonaService.name);
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly apiVersion: string;
    private readonly templateId: string;
    private readonly environment: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('PERSONA_API_URL') || 'https://api.withpersona.com';
        this.apiKey = this.configService.get<string>('PERSONA_API_KEY') || '';
        this.apiVersion = this.configService.get<string>('PERSONA_API_VERSION') || '2023-01-05';
        this.templateId = this.configService.get<string>('PERSONA_TEMPLATE_ID') || '';
        this.environment = this.configService.get<string>('PERSONA_ENVIRONMENT', 'sandbox');

        this.logger.log(`Persona API inicializada en modo: ${this.environment}`);
    }

    /**
     * Crea una nueva verificación de identidad (Inquiry)
     * @param referenceId - ID de referencia (puede ser el CI o ID del dueño)
     * @param metadata - Datos adicionales opcionales
     */
    async crearVerificacion(referenceId: string, metadata?: Record<string, any>) {
        console.log('Config:', {
            baseUrl: this.baseUrl,
            apiKey: this.apiKey?.substring(0, 20) + '...',
            templateId: this.templateId,
            version: this.apiVersion
        });
        try {
            const payload = {
                data: {
                    type: 'inquiry',
                    attributes: {
                        'inquiry-template-id': this.templateId,
                        'reference-id': referenceId,
                        "fields": {
                            "name-first": "Oscar",
                            "address-city": "avsagag",
                            "birthdate": "2005-02-09",
                            "phone-number": "+591 72087557"
                        }
                    },
                },
            };

            this.logger.debug(`Creando verificación para: ${referenceId}`);

            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.baseUrl}/api/v1/inquiries`,
                    payload,
                    {
                        headers: this.getHeaders(),
                    },
                ),
            );

            this.logger.log(`Verificación creada exitosamente: ${response.data.data.id}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error al crear verificación: ${error.message}`);
            throw new HttpException(
                `Error al crear verificación en Persona: ${error.response?.data?.errors?.[0]?.title || error.message}`,
                error.response?.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    /**
     * Obtiene el estado de una verificación existente
     * @param inquiryId - ID de la verificación
     */
    async obtenerEstadoVerificacion(inquiryId: string) {
        try {
            this.logger.debug(`Obteniendo estado de verificación: ${inquiryId}`);

            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/api/v1/inquiries/${inquiryId}`,
                    {
                        headers: this.getHeaders(),
                    },
                ),
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error al obtener estado: ${error.message}`);
            throw new HttpException(
                `Error al obtener estado de verificación: ${error.response?.data?.errors?.[0]?.title || error.message}`,
                error.response?.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    /**
     * Verifica si una inquiry fue aprobada
     * @param inquiryId - ID de la verificación
     */
    async estaAprobada(inquiryId: string): Promise<boolean> {
        try {
            const response = await this.obtenerEstadoVerificacion(inquiryId);
            const status = response.data.attributes.status;

            this.logger.debug(`Estado de verificación ${inquiryId}: ${status}`);

            return status === 'approved' || status === 'completed';
        } catch (error) {
            this.logger.error(`Error al verificar aprobación: ${error.message}`);
            return false;
        }
    }

    /**
     * Obtiene información de un documento verificado
     * @param inquiryId - ID de la verificación
     */
    async obtenerDocumentoVerificado(inquiryId: string) {
        try {
            const response = await this.obtenerEstadoVerificacion(inquiryId);
            const verificationId = response.data.relationships?.verifications?.data?.[0]?.id;

            if (!verificationId) {
                throw new HttpException(
                    'No se encontró verificación de documento',
                    HttpStatus.NOT_FOUND,
                );
            }

            const verificationResponse = await firstValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/api/v1/verifications/${verificationId}`,
                    {
                        headers: this.getHeaders(),
                    },
                ),
            );

            return verificationResponse.data;
        } catch (error) {
            this.logger.error(`Error al obtener documento: ${error.message}`);
            throw new HttpException(
                `Error al obtener documento verificado: ${error.message}`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    /**
     * Genera URL de sesión embebida para que el usuario complete la verificación
     * @param inquiryId - ID de la verificación
     */
    async generarSessionURL(inquiryId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.baseUrl}/api/v1/inquiry-sessions`,
                    {
                        data: {
                            //type: 'inquiry-session',
                            attributes: {
                                'inquiry-id': inquiryId,
                            },
                        },
                    },
                    {
                        headers: this.getHeaders(),
                    },
                ),
            );

            return response.data.data.attributes['session-token'];
        } catch (error) {
            this.logger.error(`Error al generar session URL: ${error.message}`);
            throw new HttpException(
                `Error al generar URL de sesión: ${error.message}`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    /**
     * Genera los headers necesarios para las peticiones
     */
    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Persona-Version': this.apiVersion,
            'Key-Inflection': 'camel',
        };
    }
}
