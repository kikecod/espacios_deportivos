# Backend Reservas de ESPACIOS DEPORTIVOS

**I'm dgbau**

Sistema backend Nest + PostgreSQL para la gestion de espacios deportivos.

## Configuración

1. Instalar dependencias

```bash
npm install

#Importante para el REDIS
docker-compose up -d
```

2. Variables de entorno

```bash
copy .env.example .env
# Edita .env (DB, JWT, CORS)
```

3. (Necesariamente para pruebas) Crear/actualizar usuario administrador (seed idempotente)

```bash
npm run db:seed-admin
```

## Ejecución

```bash
# Desarrollo (recarga automática)
npm run start:dev

# produccion
npm run start:prod

# Build
npm run build
```

## Base de datos (opcional)

```bash
# Configurar base de datos si no existe
npm run db:setup
```

## Pruebas

```bash
# Unit tests
npm run test

# E2E tests
npm run test�2e

# Cobertura
npm run test�ov
```

## Notas

- CORS configurable por `CORS_ORIGINS` (CSV) y cookie refresh por `COOKIE_AUTH_PATH`.
- En producciin, `synchronize` esta deshabilitado; usa migraciones si las agregas en el futuro.