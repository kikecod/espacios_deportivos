import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = this.buildErrorResponse(exception, request, status);

    if (Sentry.getClient()) {
      Sentry.captureException(exception);
    }

    const logContext = `method=${request.method} path=${request.url} status=${status}`;
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(`HTTP exception captured: ${logContext}`, stack);
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
