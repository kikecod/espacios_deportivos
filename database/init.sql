-- ================================================
-- CONFIGURACIÓN INICIAL PARA POSTGRESQL
-- ================================================
-- Este script solo crea la BASE DE DATOS.
-- Las TABLAS se crean automáticamente con TypeORM.

-- Crear la base de datos (ejecutar como superusuario)
CREATE DATABASE backend_reservas;

-- Opcional: Crear un usuario específico para la aplicación
-- CREATE USER app_user WITH PASSWORD 'secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE backend_reservas TO app_user;

-- ================================================
-- INFORMACIÓN IMPORTANTE:
-- ================================================
-- ✅ TypeORM se encarga de:
--    - Crear la tabla 'personas'
--    - Crear todas las columnas
--    - Crear índices y constraints
--    - Sincronizar cambios en las entidades
--
-- ❌ Necesitas hacer manualmente:
--    - Crear la base de datos (este script)
--    - Configurar permisos de usuario
-- ================================================

-- Una vez creada la base de datos, inicia la aplicación:
-- npm run start:dev
-- 
-- TypeORM creará automáticamente esta estructura:
--
-- TABLE personas (
--     "idPersona" SERIAL PRIMARY KEY,
--     "nombres" VARCHAR NOT NULL,
--     "paterno" VARCHAR NOT NULL, 
--     "materno" VARCHAR NOT NULL,
--     "documentoTipo" VARCHAR NOT NULL DEFAULT 'CC',
--     "documentoNumero" VARCHAR NOT NULL UNIQUE,
--     "telefono" VARCHAR,
--     "telefonoVerificado" BOOLEAN DEFAULT false,
--     "fechaNacimiento" DATE,
--     "genero" VARCHAR,
--     "urlFoto" TEXT,
--     "creadoEn" TIMESTAMP DEFAULT now(),
--     "actualizadoEn" TIMESTAMP DEFAULT now()
-- );