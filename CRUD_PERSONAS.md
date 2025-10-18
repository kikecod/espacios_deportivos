# CRUD de Personas - Sistema de Espacios Deportivos

Este proyecto implementa un CRUD completo para la entidad Persona usando NestJS, TypeORM y MySQL.

## 🚀 Características

- **CRUD Completo**: Crear, leer, actualizar y eliminar personas
- **Validación**: Validación de datos con class-validator
- **Base de Datos**: Integración con MySQL usando TypeORM
- **Búsquedas**: Búsqueda por nombre, documento y género
- **Estructura Modular**: Arquitectura NestJS bien organizada

## 📋 Atributos de la Entidad Persona

- `id_persona`: ID único autoincrementable
- `nombres`: Nombres de la persona
- `paterno`: Apellido paterno
- `materno`: Apellido materno
- `documento_tipo`: Tipo de documento (CC, CE, TI, PP)
- `documento_numero`: Número de documento (único)
- `telefono`: Número de teléfono (opcional)
- `telefono_verificado`: Estado de verificación del teléfono
- `fecha_nacimiento`: Fecha de nacimiento (opcional)
- `genero`: Género (MASCULINO, FEMENINO, OTRO - opcional)
- `url_foto`: URL de la foto de perfil (opcional)
- `creado_en`: Fecha de creación (automática)
- `actualizado_en`: Fecha de actualización (automática)

## 🛠️ Configuración

### 1. Prerrequisitos
- Node.js (v18 or superior)
- MySQL Server
- npm o yarn

### 2. Instalación

```bash
# Instalar dependencias
npm install

# Las dependencias principales ya están incluidas:
# - @nestjs/typeorm
# - typeorm
# - mysql2
# - @nestjs/config
# - class-validator
# - class-transformer
# - @nestjs/mapped-types
```

### 3. Configuración de la Base de Datos

1. **Crear la base de datos MySQL:**
   ```sql
   CREATE DATABASE espacios_deportivos;
   ```

2. **Configurar las variables de entorno:**
   
   Edita el archivo `.env` con tus credenciales de MySQL:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=tu_password
   DB_DATABASE=espacios_deportivos
   NODE_ENV=development
   ```

### 4. Ejecutar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Endpoints de la API

### Personas

| Método | Endpoint | Descripción |
|---------|----------|-------------|
| GET | `/personas` | Obtener todas las personas |
| GET | `/personas?nombre=Juan` | Buscar por nombre |
| GET | `/personas?genero=MASCULINO` | Buscar por género |
| GET | `/personas/count` | Contar total de personas |
| GET | `/personas/:id` | Obtener persona por ID |
| GET | `/personas/documento/:numero` | Obtener persona por documento |
| POST | `/personas` | Crear nueva persona |
| PATCH | `/personas/:id` | Actualizar persona |
| DELETE | `/personas/:id` | Eliminar persona |

### Ejemplos de uso

#### Crear una persona:
```bash
curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Juan Carlos",
    "paterno": "Pérez",
    "materno": "García",
    "documento_tipo": "CC",
    "documento_numero": "12345678",
    "telefono": "3001234567",
    "fecha_nacimiento": "1990-01-15",
    "genero": "MASCULINO"
  }'
```

#### Obtener todas las personas:
```bash
curl http://localhost:3000/personas
```

#### Actualizar una persona:
```bash
curl -X PATCH http://localhost:3000/personas/1 \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "3009876543",
    "telefono_verificado": true
  }'
```

## 🏗️ Estructura del Proyecto

```
src/
  personas/
    dto/
      create-persona.dto.ts    # DTO para crear persona
      update-persona.dto.ts    # DTO para actualizar persona
    personas.controller.ts     # Controlador con endpoints
    personas.entity.ts         # Entidad TypeORM
    personas.service.ts        # Lógica de negocio
    personas.module.ts         # Módulo NestJS
  app.module.ts               # Módulo principal
  main.ts                     # Punto de entrada
database/
  init.sql                    # Script de inicialización de DB
```

## 🔧 Características Técnicas

- **Validación**: Uso de decoradores de class-validator
- **Transformación**: Conversión automática de tipos
- **Unicidad**: Validación de documento único
- **Relaciones**: Preparado para futuras relaciones
- **Logging**: Activado en modo desarrollo
- **CORS**: Habilitado para frontend
- **Sync**: Sincronización automática en desarrollo

## 🎯 Próximos Pasos

1. **Agregar más entidades** (Espacios, Reservas, etc.)
2. **Implementar autenticación** y autorización
3. **Agregar paginación** para grandes conjuntos de datos
4. **Crear tests unitarios** e integración
5. **Documentación Swagger** para la API
6. **Validaciones de negocio** más específicas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request