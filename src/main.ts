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
  app.enableShutdownHooks();

  // Forzar puerto estable 3000 para que el proxy de Vite (/api) funcione siempre.
  // Si el puerto está en uso, fallar explícitamente con un mensaje claro.
  try {
    await app.listen(basePort, '0.0.0.0');
  } catch (err: any) {
    if (err?.code === 'EADDRINUSE') {
      Logger.error(
        `El puerto ${basePort} ya está en uso. Libera el puerto o ajusta PORT en el backend y VITE_API_BASE_URL en el frontend.`,
        'Bootstrap',
      );
    }
    throw err;
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
