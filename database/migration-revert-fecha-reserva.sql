-- ================================================
-- MIGRACIÓN: REVERTIR campo "fecha" en reserva
-- Fecha: 30 de octubre de 2025
-- ================================================

-- 1. Eliminar el campo "fecha" de la tabla "reserva"
ALTER TABLE reserva 
DROP COLUMN IF EXISTS fecha;

-- 2. Crear índice optimizado en iniciaEn para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_reserva_fecha_iniciaEn ON reserva((DATE("iniciaEn")));

-- 3. Mantener índices existentes para optimización
CREATE INDEX IF NOT EXISTS idx_reserva_iniciaEn ON reserva("iniciaEn");
CREATE INDEX IF NOT EXISTS idx_reserva_estado ON reserva(estado);

-- ================================================
-- INFORMACIÓN:
-- ================================================
-- ✅ Se eliminó campo "fecha" de reserva
-- ✅ Se creó índice funcional en DATE(iniciaEn)
-- ✅ Ahora se usa DATE(iniciaEn) para filtrar por fecha
-- 
-- Los índices funcionales permiten búsquedas rápidas como:
-- WHERE DATE(iniciaEn) = '2025-11-02'
-- ================================================
