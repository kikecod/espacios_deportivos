# Backend Reservas de **ESPACIOS DEPORTIVOS** by **dgbau**

Sistema backend desarrollado con NestJS y PostgreSQL para la gestión de espacios deportivos de un sistema de reservas.

## Configuración

1. **Clonar el repositorio e instalar dependencias:**

```bash
git clone -b dgbau https://github.com/kikecod/espacios_deportivos.git
cd backend-reservas
npm install
```

2. **Configurar variables de entorno:**

Cambia el nombre del archivo `.env.template` a `.env` y ajusta los valores según tu configuración

## Instalación y Ejecución

### **Inicio Rápido (Recomendado by DGBAU)**

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno y ajustar si es necesario
copy .env.example .env
# (editar .env y poner las credenciales de BD / JWT)

# 3. Para crear o asegurar el usuario administrador (seed idempotente)
npm run db:seed-admin

# 4. Finalmente ejecutar la app en modo desarrollo
npm run start:dev
```

### **Comandos Disponibles**

```bash
# Configuración automática de DB + iniciar app
npm run setup

# Solo iniciar PostgreSQL con Docker
npm run db:up

# Solo configurar la base de datos
npm run db:setup

# Desarrollo (con recarga automática) NORMALMENTE ESTE UTILIZO
npm run start:dev

# Producción
npm run start:prod

# Construcción
npm run build
```

## Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura de código
npm run test:cov
```

# **Welcome to my branch, dgbau**
Yep, that's me, dgbau -- trying to fix everything, trying not to be the same.

* keep the rules!!!!
* I do try to understand you.

Todavia desarrollando el backend