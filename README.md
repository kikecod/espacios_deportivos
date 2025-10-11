# Backend Reservas de ESPACIOS DEPORTIVOS

Sistema backend Nest� + PostgreSQL para gest�n de espacios deportivos.

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

3. (Opcional) Crear/actualizar usuario administrador (seed idempotente)

```bash
npm run db:seed-admin
```

## Ejecución

```bash
# Desarrollo (recarga automática)
npm run start:dev

# producci�n
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
- En producci�n, `synchronize` est� deshabilitado; usa migraciones si las agregas en el futuro.

