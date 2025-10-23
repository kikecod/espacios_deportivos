import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';
import * as Sentry from '@sentry/node';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = this.buildErrorResponse(exception, request, status);

    if (Sentry.getClient()) {
      Sentry.captureException(exception);
    }

    this.logger.error({ err: exception, path: request.url, method: request.method }, 'HTTP exception captured');
    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request, status: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return {
          statusCode: status,
          path: request.url,
          timestamp: new Date().toISOString(),
          message: response,
        };
      }

      return {
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString(),
        ...response,
      };
    }

    return {
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: 'Internal server error',
    };
  }
}
