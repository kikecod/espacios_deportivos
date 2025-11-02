-- ================================================
-- MIGRACIÓN: Búsqueda Avanzada de Canchas
-- Fecha: 30 de octubre de 2025
-- ACTUALIZADO: Usar indexación en lugar de campo fecha
-- ================================================

-- 1. Agregar campo "zona" a la tabla "sede"
ALTER TABLE sede 
ADD COLUMN IF NOT EXISTS zona VARCHAR(100);

-- 2. Crear índices para optimización de búsqueda
CREATE INDEX IF NOT EXISTS idx_sede_zona ON sede(zona);
CREATE INDEX IF NOT EXISTS idx_reserva_fecha_iniciaEn ON reserva((DATE("iniciaEn")));
CREATE INDEX IF NOT EXISTS idx_reserva_iniciaEn ON reserva("iniciaEn");
CREATE INDEX IF NOT EXISTS idx_reserva_estado ON reserva(estado);
CREATE INDEX IF NOT EXISTS idx_cancha_estado ON cancha(estado);

-- 3. Opcional: Poblar zonas para sedes existentes (ajustar según tus datos)
-- Ejemplo: UPDATE sede SET zona = 'Zona Sur' WHERE idSede IN (1, 2, 3);
-- Ejemplo: UPDATE sede SET zona = 'Sopocachi' WHERE idSede IN (4, 5);

-- ================================================
-- INFORMACIÓN:
-- ================================================
-- ✅ Se agregó campo "zona" en sede
-- ✅ Se crearon índices funcionales en DATE(iniciaEn)
-- ✅ NO se creó campo "fecha" separado en reserva
-- ✅ Se usa DATE(iniciaEn) para filtrar por fecha
-- 
-- ⚠️  ACCIÓN REQUERIDA:
-- Debes actualizar manualmente el campo "zona" de tus sedes existentes
-- con valores como: 'Zona Sur', 'Sopocachi', 'Centro', 'Miraflores', etc.
-- 
-- Ejemplo:
-- UPDATE sede SET zona = 'Zona Sur' WHERE direccion LIKE '%Sur%';
-- ================================================
