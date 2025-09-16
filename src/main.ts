import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Habilitar CORS para el frontend
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📋 API Personas: http://localhost:${port}/personas`);
  console.log(`👤 API Usuarios: http://localhost:${port}/usuarios`);
  console.log(`🔐 API Roles: http://localhost:${port}/roles`);
}
bootstrap();
