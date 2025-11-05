# 🏟️ Sistema de Gestión de Espacios Deportivos - Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**API REST robusta para la gestión integral de espacios deportivos**

[🚀 Características](#-características-principales) •
[📋 Requisitos](#-requisitos-previos) •
[⚙️ Instalación](#️-instalación) •
[📚 Documentación](#-documentación-de-api)

</div>

---

## 📖 Descripción del Proyecto

Sistema backend completo desarrollado con **NestJS** y **PostgreSQL** para la gestión de espacios deportivos (canchas). Permite administrar reservas, usuarios, pagos, calificaciones y más, con arquitectura modular y escalable.

### 🎯 Objetivo

Proporcionar una API REST completa y segura para:
- Gestión de sedes y canchas deportivas
- Sistema de reservas con disponibilidad en tiempo real
- Autenticación y autorización por roles (JWT)
- Procesamiento de pagos y transacciones
- Sistema de calificaciones y reseñas
- Panel administrativo completo

---

## ✨ Características Principales

### 🔐 Autenticación y Autorización
- ✅ JWT (JSON Web Tokens)
- ✅ Sistema de roles (Admin, Dueño, Cliente, Controlador)
- ✅ Guards personalizados
- ✅ Refresh tokens
- ✅ Verificación de correo electrónico

### 🏢 Gestión de Entidades
- ✅ **Personas**: CRUD completo con validaciones
- ✅ **Usuarios**: Gestión de cuentas y perfiles
- ✅ **Sedes**: Administración de complejos deportivos
- ✅ **Canchas**: Gestión de espacios con fotos y especificaciones
- ✅ **Disciplinas**: Tipos de deportes disponibles

### 📅 Sistema de Reservas
- ✅ Creación y gestión de reservas
- ✅ Validación de disponibilidad en tiempo real
- ✅ Sistema de confirmación/aprobación
- ✅ Cancelación con registro de motivos
- ✅ Estados de reserva (Pendiente, Confirmada, Completada, Cancelada)
- ✅ Límite de 14 días para reseñas post-reserva

### 💳 Gestión de Pagos
- ✅ Registro de transacciones
- ✅ Estados de pago (Pendiente, Aprobada, Rechazada)
- ✅ Integración lista para pasarelas de pago
- ✅ Historial de transacciones

### ⭐ Sistema de Calificaciones
- ✅ Reseñas de canchas por clientes
- ✅ Sistema de puntuación (1-5 estrellas)
- ✅ Comentarios y feedback
- ✅ Cálculo automático de rating promedio
- ✅ Validación de período de reseña (14 días post-completado)

### 📊 Analytics y Reportes
- ✅ Dashboard con métricas principales
- ✅ Ingresos mensuales
- ✅ Tasa de ocupación
- ✅ Reservas por estado
- ✅ Exportación de datos (CSV)

### 🔔 Funcionalidades Adicionales
- ✅ Denuncias y reportes
- ✅ Sistema de QR para acceso
- ✅ Gestión de avatares
- ✅ Logs de actividad
- ✅ Soft delete en entidades críticas

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
backend-reservas/
├── src/
│   ├── auth/                 # Autenticación y autorización
│   │   ├── decorators/       # Decoradores personalizados
│   │   ├── guards/           # Guards de seguridad
│   │   └── strategies/       # Estrategias JWT
│   │
│   ├── config/               # Configuraciones globales
│   │   └── database.config.ts
│   │
│   ├── personas/             # Gestión de personas
│   ├── usuarios/             # Gestión de usuarios
│   ├── clientes/             # Perfil de clientes
│   ├── duenio/               # Perfil de dueños
│   ├── controlador/          # Perfil de controladores
│   │
│   ├── sede/                 # Gestión de sedes
│   ├── cancha/               # Gestión de canchas
│   ├── disciplina/           # Tipos de deportes
│   ├── fotos/                # Gestión de imágenes
│   │
│   ├── reservas/             # Sistema de reservas
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── reservas.controller.ts
│   │   ├── reservas.service.ts
│   │   └── reservas.module.ts
│   │
│   ├── transacciones/        # Gestión de pagos
│   ├── cancelacion/          # Cancelaciones
│   │
│   ├── califica_cancha/      # Sistema de reseñas
│   │   ├── dto/
│   │   ├── entities/
│   │   └── califica_cancha.service.ts
│   │
│   ├── analytics/            # Métricas y reportes
│   ├── reportes/             # Exportación de datos
│   │
│   ├── profile/              # Gestión de perfiles
│   ├── pases_acceso/         # Sistema QR
│   ├── denuncia/             # Denuncias
│   │
│   ├── database/             # Seeders y utilidades DB
│   │   └── seeds/
│   │
│   └── main.ts               # Punto de entrada
│
├── uploads/                  # Archivos subidos
│   └── avatars/              # Fotos de perfil
│
├── database/                 # Scripts SQL
│   └── init.sql
│
├── test/                     # Tests E2E
├── docker-compose.yml        # Configuración Docker
└── package.json
```

### Módulos Principales

| Módulo | Descripción |
|--------|-------------|
| **AuthModule** | Autenticación JWT, login, registro |
| **ReservasModule** | CRUD de reservas, validaciones |
| **TransaccionesModule** | Gestión de pagos |
| **CalificaCanchaModule** | Sistema de reseñas y ratings |
| **AnalyticsModule** | Métricas y estadísticas |
| **ProfileModule** | Gestión de perfiles de usuario |
| **DatabaseModule** | Seeders y utilidades |

---

## 🛠️ Tecnologías Utilizadas

### Core
- **NestJS** `^10.0.0` - Framework backend
- **TypeScript** `^5.1.3` - Lenguaje de programación
- **Node.js** `>=16.x` - Runtime

### Base de Datos
- **PostgreSQL** `^14.x` - Base de datos relacional
- **TypeORM** `^0.3.17` - ORM
- **pg** `^8.11.3` - Driver PostgreSQL

### Autenticación
- **JWT** - JSON Web Tokens
- **bcrypt** `^5.1.1` - Hash de contraseñas
- **Passport** `^0.7.0` - Estrategias de autenticación

### Validación
- **class-validator** `^0.14.0`
- **class-transformer** `^0.5.1`

### Utilidades
- **sharp** `^0.33.2` - Procesamiento de imágenes
- **multer** `^1.4.5-lts.1` - Upload de archivos
- **dotenv** `^16.3.1` - Variables de entorno

### Testing
- **Jest** - Framework de testing
- **Supertest** - Testing E2E

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 16.x ([Descargar](https://nodejs.org/))
- **PostgreSQL** >= 14.x ([Descargar](https://www.postgresql.org/download/))
- **npm** >= 8.x o **yarn** >= 1.22
- **Git** ([Descargar](https://git-scm.com/))
- **Docker** (Opcional, recomendado) ([Descargar](https://www.docker.com/))

---

## ⚙️ Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/kikecod/espacios_deportivos.git
cd espacios_deportivos/backend-reservas
```

### 2️⃣ Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=backend_reservas

# JWT
JWT_SECRET=tu_super_secreto_jwt_aqui
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=tu_refresh_secret_aqui
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development

# Email (Opcional)
PROFILE_EMAIL_TOKEN_TTL_MINUTES=30

# Upload
MAX_FILE_SIZE=5242880
```

### 4️⃣ Configurar Base de Datos

#### Opción A: Con Docker (Recomendado) 🐳

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d

# La base de datos se creará automáticamente
```

#### Opción B: PostgreSQL Local

```bash
# Crear la base de datos
psql -U postgres
CREATE DATABASE backend_reservas;
\q

# TypeORM creará las tablas automáticamente
```

### 5️⃣ Ejecutar Migraciones y Seeders (Opcional)

```bash
# Poblar la base de datos con datos de prueba
npm run seed
```

### 6️⃣ Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servidor estará disponible en: **http://localhost:3000**

---

## 🚀 Uso Rápido

### Endpoints Principales

#### 🔐 Autenticación

```bash
# Registro de usuario
POST /api/auth/register
{
  "nombres": "Juan",
  "paterno": "Pérez",
  "materno": "García",
  "documentoNumero": "12345678",
  "correo": "juan@example.com",
  "usuario": "juanperez",
  "contrasena": "Password123!",
  "rol": "CLIENTE"
}

# Login
POST /api/auth/login
{
  "correo": "juan@example.com",
  "contrasena": "Password123!"
}
```

#### 📅 Reservas

```bash
# Crear reserva
POST /api/reservas
Authorization: Bearer {token}
{
  "idCliente": 1,
  "idCancha": 1,
  "iniciaEn": "2025-11-10T10:00:00",
  "terminaEn": "2025-11-10T11:00:00",
  "cantidadPersonas": 10,
  "montoTotal": 100
}

# Obtener reservas de un usuario
GET /api/reservas/usuario/1
Authorization: Bearer {token}

# Completar reserva (permite reseñas)
PATCH /api/reservas/1/completar
Authorization: Bearer {token}
```

#### ⭐ Calificaciones

```bash
# Crear reseña
POST /api/califica-cancha
Authorization: Bearer {token}
{
  "idReserva": 1,
  "puntaje": 5,
  "comentario": "¡Excelente cancha!"
}

# Obtener reseñas de una cancha
GET /api/califica-cancha/cancha/1?page=1&limit=10&ordenar=recientes
```

#### 📊 Analytics

```bash
# Dashboard principal
GET /api/analytics/dashboard?idDuenio=1

# Estadísticas por cancha
GET /api/analytics/cancha/1?mes=2025-11

# Exportar a CSV
GET /api/reportes/dashboard-csv?idDuenio=1
```

---

## 📚 Documentación de API

### Swagger UI

Una vez iniciado el servidor, accede a la documentación interactiva en:

**http://localhost:3000/api**

### Colección Postman

Importa la colección de Postman disponible en: `/docs/postman_collection.json`

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e

# Modo watch
npm run test:watch
```

---

## 🗂️ Modelo de Base de Datos

### Estados de Reserva

```
PENDIENTE → CONFIRMADA → COMPLETADA
    ↓           ↓
CANCELADA   RECHAZADA
```

### Relaciones Principales

- **Persona** → **Usuario** (1:1)
- **Usuario** → **Cliente/Dueño/Controlador** (1:1)
- **Dueño** → **Sede** (1:N)
- **Sede** → **Cancha** (1:N)
- **Cliente** → **Reserva** (1:N)
- **Cancha** → **Reserva** (1:N)
- **Reserva** → **Transacción** (1:N)
- **Reserva** → **CalificaCancha** (1:1)

---

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run start` | Inicia el servidor en modo normal |
| `npm run start:dev` | Inicia con hot-reload (desarrollo) |
| `npm run start:prod` | Inicia en modo producción |
| `npm run build` | Compila el proyecto |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea código con Prettier |
| `npm run test` | Ejecuta tests |
| `npm run seed` | Pobla la BD con datos de prueba |

---

## 🐳 Docker

### Iniciar con Docker Compose

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

### Servicios Incluidos

- **PostgreSQL**: Puerto 5432
- **Backend**: Puerto 3000
- **Volumes**: Persistencia de datos

---

## 📁 Variables de Entorno

### Configuración Completa

```env
# === DATABASE ===
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=backend_reservas
DB_SYNCHRONIZE=true  # Solo desarrollo

# === JWT ===
JWT_SECRET=super_secret_key_change_in_production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=refresh_secret_key
JWT_REFRESH_EXPIRATION=7d

# === SERVER ===
PORT=3000
NODE_ENV=development  # development | production | test

# === UPLOAD ===
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_PATH=./uploads

# === EMAIL ===
PROFILE_EMAIL_TOKEN_TTL_MINUTES=30

# === CORS ===
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

---

## 🔒 Seguridad

### Implementaciones de Seguridad

- ✅ Hash de contraseñas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Validación de datos de entrada
- ✅ Guards por roles
- ✅ Sanitización de inputs
- ✅ Rate limiting (recomendado en producción)
- ✅ Helmet (headers de seguridad)

### Buenas Prácticas

```typescript
// Ejemplo de endpoint protegido
@Auth([TipoRol.ADMIN, TipoRol.DUENIO])
@Get('dashboard')
getDashboard(@ActiveUser() user: ActiveUserPayload) {
  return this.analyticsService.getDashboard(user.idDuenio);
}
```

---

## 🚀 Deployment

### Variables de Producción

```env
NODE_ENV=production
DB_SYNCHRONIZE=false  # ⚠️ Importante: false en producción
JWT_SECRET=cambiar_por_secreto_fuerte
DB_SSL=true
```

### Recomendaciones

1. Usar variables de entorno seguras
2. Configurar SSL en PostgreSQL
3. Implementar rate limiting
4. Configurar logging apropiado
5. Usar PM2 o similar para gestión de procesos
6. Implementar monitoring (Sentry, etc.)

---

## 🤝 Contribución

### Flujo de Trabajo

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- Usar TypeScript estricto
- Seguir las guías de estilo de NestJS
- Documentar funciones complejas
- Escribir tests para nuevas features
- Usar commits semánticos

---

## 📝 Changelog

### v1.1.0 (2025-11-05)
- ✨ Agregado sistema de completado de reservas
- ✨ Implementado límite de 14 días para reseñas
- ✨ Endpoint de simulación de uso (DEV)
- 🐛 Corregido avatar de usuarios en reseñas
- 🐛 Corregido campo `completadaEn` en respuestas

### v1.0.0 (2025-11-03)
- 🎉 Lanzamiento inicial
- ✨ Sistema completo de reservas
- ✨ Autenticación y autorización
- ✨ Sistema de calificaciones
- ✨ Analytics y reportes

---

## 📄 Licencia

Este proyecto es de uso académico y no tiene licencia comercial.

---

## 👥 Autores

**Enrique Rafael Fernandez**
- GitHub: [@kikecod](https://github.com/kikecod)
- Proyecto Académico - 6to Semestre

---

## 📞 Soporte

Para dudas o problemas:

- 🐛 Issues: [GitHub Issues](https://github.com/kikecod/espacios_deportivos/issues)
- 📧 Email: Contactar vía GitHub

---

## 🙏 Agradecimientos

- NestJS Team por el excelente framework
- TypeORM por el ORM robusto
- Comunidad de código abierto

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub**

[⬆ Volver arriba](#-sistema-de-gestión-de-espacios-deportivos---backend)

</div>
