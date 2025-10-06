// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser'; // si usas refresh por cookie

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  app.use(cookieParser()); // habilítalo si considerarás refresh en cookie

  const config = new DocumentBuilder()
    .setTitle('API Espacios Deportivos')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    // === IMPORTANTE: agregar los dos esquemas ===
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refresh-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Evita montar Swagger exactamente en el mismo path que tu prefix.
  // Mejor /api/docs:
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
