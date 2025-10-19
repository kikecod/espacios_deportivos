# Backend Reservas - CRUD de Personas

Sistema backend desarrollado con NestJS y PostgreSQL para la gestión de personas en un sistema de reservas de espacios deportivos.

Hola Mundo de desarroladores como estan analicenlo aun q solo se hizo cambios de atributos q tenian un caracter mayuscula en el centro de la palabra

* EJEMPLO ``idGeneral => id_general``


## Configuración

1. **Clonar el repositorio e instalar dependencias:**

```bash
git clone -b dgbautista https://github.com/kikecod/espacios_deportivos.git
cd backend-reservas
npm install
```


## Instalación y Ejecución

### 🚀 **Inicio Rápido (Recomendado)**

```bash
# 1. Instalar dependencias
npm install

# 2. Crear tablas con el ORM
npm start run:dev

# 3. importante para hacer pruebas
npm run seed
```

### 📋 **Comandos Disponibles**

```bash
# Configuración automática de DB + iniciar app
npm run setup

# Solo iniciar PostgreSQL con Docker
npm run db:up

# Solo configurar la base de datos
npm run db:setup

# Desarrollo (con recarga automática)
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

