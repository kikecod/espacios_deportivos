# Backend Reservas - CRUD de Personas

Sistema backend desarrollado con NestJS y PostgreSQL para la gestión de personas en un sistema de reservas de espacios deportivos.

## Características

- ✅ CRUD completo de personas
- ✅ Validación de datos con class-validator
- ✅ Base de datos PostgreSQL con TypeORM
- ✅ API REST con documentación
- ✅ Configuración por variables de entorno

## Estructura del Proyecto

```
src/
├── config/           # Configuración de base de datos
├── personas/         # Módulo de personas
│   ├── dto/         # Data Transfer Objects
│   ├── personas.entity.ts
│   ├── personas.service.ts
│   ├── personas.controller.ts
│   └── personas.module.ts
└── main.ts          # Punto de entrada
```

## Prerequisitos

- Node.js (versión 16 o superior)
- PostgreSQL (versión 12 o superior)
- npm o yarn

## Configuración

1. **Clonar el repositorio e instalar dependencias:**

```bash
git clone <repository-url>
cd backend-reservas
npm install
```

2. **Configurar PostgreSQL:**

⚠️ **IMPORTANTE**: TypeORM crea las tablas automáticamente, pero necesitas crear la base de datos primero.

```bash
# Opción 1: Con Docker (Recomendado - más fácil)
npm run db:up

# Opción 2: PostgreSQL local (macOS)
brew install postgresql
brew services start postgresql

# Crear solo la base de datos (las tablas las crea TypeORM)
psql postgres -c "CREATE DATABASE backend_reservas;"
```

💡 **¿Qué hace TypeORM automáticamente?**
- ✅ Crea la tabla `personas` con todas las columnas
- ✅ Crea índices y constraints 
- ✅ Sincroniza cambios cuando modificas la entidad
- ❌ NO crea la base de datos (eso debes hacerlo tú)

3. **Configurar variables de entorno:**

Copia el archivo `.env` y ajusta los valores según tu configuración:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=backend_reservas
NODE_ENV=development
```

## Instalación y Ejecución

### 🚀 **Inicio Rápido (Recomendado)**

```bash
# 1. Instalar dependencias
npm install

# 2. Opción A: Con Docker (más fácil)
npm run dev

# 2. Opción B: Con PostgreSQL local
npm run setup
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

### 🔧 **Configuración Manual**

Si prefieres configurar todo manualmente:

```bash
# 1. Instalar PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# 2. Crear solo la base de datos
psql postgres -c "CREATE DATABASE backend_reservas;"

# 3. Iniciar la aplicación
npm run start:dev
```

## API Endpoints

### Personas CRUD

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET    | `/personas` | Obtener todas las personas |
| GET    | `/personas/:id` | Obtener persona por ID |
| POST   | `/personas` | Crear nueva persona |
| PUT    | `/personas/:id` | Actualizar persona |
| DELETE | `/personas/:id` | Eliminar persona |

### Ejemplo de Datos

```json
{
  "nombres": "Juan Carlos",
  "paterno": "Pérez",
  "materno": "López",
  "documentoTipo": "CC",
  "documentoNumero": "1234567890",
  "telefono": "3001234567",
  "telefonoVerificado": false,
  "fechaNacimiento": "1990-01-01",
  "genero": "MASCULINO",
  "urlFoto": "https://example.com/foto.jpg"
}
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

## Tecnologías Utilizadas

- **NestJS** - Framework de Node.js
- **TypeORM** - ORM para TypeScript/JavaScript
- **PostgreSQL** - Base de datos relacional
- **class-validator** - Validación de datos
- **class-transformer** - Transformación de objetos

## Estructura de la Base de Datos

La tabla `personas` contiene los siguientes campos:

- `idPersona` (SERIAL PRIMARY KEY)
- `nombres` (VARCHAR)
- `paterno` (VARCHAR)
- `materno` (VARCHAR)
- `documentoTipo` (VARCHAR)
- `documentoNumero` (VARCHAR UNIQUE)
- `telefono` (VARCHAR)
- `telefonoVerificado` (BOOLEAN)
- `fechaNacimiento` (DATE)
- `genero` (VARCHAR)
- `urlFoto` (TEXT)
- `creadoEn` (TIMESTAMP)
- `actualizadoEn` (TIMESTAMP)

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
