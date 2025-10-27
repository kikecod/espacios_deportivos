import * as Sentry from '@sentry/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
      tracesSampleRate: parseFloat(
        process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0',
      ),
      profilesSampleRate: parseFloat(
        process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0',
      ),
    });
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  app.setGlobalPrefix('api');
  // Deshabilitamos versionado por ahora para compatibilidad con clientes existentes
  // Las rutas quedan expuestas directamente bajo /api/* sin exigir /v1 ni headers
  // Si en el futuro se requiere versionado, se puede reactivar y coordinar con el frontend
  // app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(cookieParser());

  // Validacion global
  app.useGlobalPipes(
    new SanitizationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : true;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('API Espacios Deportivos')
    .setDescription('Documentacion de la API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ 'JWT-auth': [] }];
  SwaggerModule.setup('api', app, document);

  const basePort = parseInt(process.env.PORT ?? '3000', 10);
  // Let NestJS handle shutdown gracefully (includes TypeORM connection cleanup)
  // Avoid adding custom process signal handlers that also call app.close(),
  // to prevent double-closing the DB pool ("Called end on pool more than once").
  app.enableShutdownHooks();

  // Tiny retry loop to handle rare race where previous watcher instance still holds the port briefly
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const maxAttemptsPerPort = 5;
  const maxPortShift = 10;
  let attempt = 0;
  let portShift = 0;
  let boundPort: number | null = null;

  while (true) {
    try {
      const targetPort = basePort + portShift;
      await app.listen(targetPort);
      boundPort = targetPort;
      break;
    } catch (err: unknown) {
      const errCode =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : undefined;
      if (errCode === 'EADDRINUSE') {
        attempt++;
        if (attempt <= maxAttemptsPerPort) {
          const backoff = 300 + attempt * 200; // 0.3s, 0.5s, 0.7s, ...
          Logger.warn(
            `Port ${basePort + portShift} in use on attempt ${attempt}/${maxAttemptsPerPort}. Retrying in ${backoff}ms...`,
          );
          await sleep(backoff);
          continue;
        }

        portShift++;
        attempt = 0;
        if (portShift > maxPortShift) {
          Logger.error(
            `Unable to acquire a free port after checking ${maxPortShift + 1} consecutive ports starting at ${basePort}.`,
          );
          throw err;
        }

        Logger.warn(
          `Port ${basePort + portShift - 1} still busy after ${maxAttemptsPerPort} retries. Trying port ${
            basePort + portShift
          }...`,
        );
        continue;
      }
      throw err;
    }
  }

  if (boundPort && boundPort !== basePort) {
    Logger.warn(
      `Puerto ${basePort} ocupado. La aplicacion escuchara en el puerto alternativo ${boundPort}. Actualiza tus clientes si es necesario.`,
      'Bootstrap',
    );
  }

  const appUrl = await app.getUrl();
  Logger.log(`Nest application is running on: ${appUrl}`, 'Bootstrap');
}
// Prevent double bootstrap in certain Windows watch modes that re-require the entrypoint in the same process
const globalAny = global as unknown as { __NEST_APP_BOOTSTRAPPED__?: boolean };
if (!globalAny.__NEST_APP_BOOTSTRAPPED__) {
  globalAny.__NEST_APP_BOOTSTRAPPED__ = true;
  void bootstrap();
} else {
  Logger.warn('Bootstrap skipped: app already running', 'Bootstrap');
}
