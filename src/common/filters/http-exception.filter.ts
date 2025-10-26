import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = this.buildErrorResponse(exception, request, status);

    // Reduce noise: skip logging and Sentry for well-known probes like Chrome DevTools
    if (request.url?.startsWith('/.well-known/')) {
      response.status(status).json(errorResponse);
      return;
    }

    // Do not send 404s to Sentry and log them as debug to avoid noise during scans/probes
    if (status !== HttpStatus.NOT_FOUND && Sentry.getClient()) {
      Sentry.captureException(exception);
    }

    const logContext = `method=${request.method} path=${request.url} status=${status}`;
    const stack = exception instanceof Error ? exception.stack : undefined;

    if (status === HttpStatus.NOT_FOUND) {
      this.logger.debug(`HTTP 404: ${logContext}`);
    } else if (status >= 400 && status < 500) {
      this.logger.warn(`HTTP ${status}: ${logContext}`);
    } else {
      this.logger.error(`HTTP exception captured: ${logContext}`, stack);
    }

    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
    status: number,
  ) {
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
