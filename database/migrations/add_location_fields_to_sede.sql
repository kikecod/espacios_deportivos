-- ============================================
-- Migración: Agregar campos de ubicación universal a Sede
-- Fecha: 2025-11-07
-- Descripción: Agrega campos estructurados de ubicación geográfica
--              para búsquedas y filtrado universal
-- ============================================

-- 1. Agregar nuevos campos de ubicación
ALTER TABLE sede 
ADD COLUMN IF NOT EXISTS country VARCHAR(100) NOT NULL DEFAULT 'Bolivia',
ADD COLUMN IF NOT EXISTS "countryCode" VARCHAR(10),
ADD COLUMN IF NOT EXISTS "stateProvince" VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD COLUMN IF NOT EXISTS "addressLine" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "postalCode" VARCHAR(20),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100);

-- 2. Agregar campos de coordenadas con tipo DECIMAL (mejor precisión)
ALTER TABLE sede 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 7);

-- 3. Hacer campos legacy opcionales (para compatibilidad)
ALTER TABLE sede 
ALTER COLUMN direccion DROP NOT NULL,
ALTER COLUMN latitud DROP NOT NULL,
ALTER COLUMN longitud DROP NOT NULL;

-- 4. Migrar datos existentes de campos legacy a nuevos campos
-- NOTA: Ajustar estos valores según tus datos reales
UPDATE sede 
SET 
  "addressLine" = COALESCE(direccion, 'Sin dirección'),
  latitude = CASE 
    WHEN latitud IS NOT NULL AND latitud ~ '^-?[0-9]+\.?[0-9]*$' 
    THEN CAST(latitud AS DECIMAL(10, 7))
    ELSE NULL 
  END,
  longitude = CASE 
    WHEN longitud IS NOT NULL AND longitud ~ '^-?[0-9]+\.?[0-9]*$' 
    THEN CAST(longitud AS DECIMAL(11, 7))
    ELSE NULL 
  END,
  country = COALESCE(country, 'Bolivia'),
  "countryCode" = COALESCE("countryCode", 'BO')
WHERE direccion IS NOT NULL;

-- 5. Hacer obligatorios los campos esenciales después de la migración
-- NOTA: Descomenta estas líneas después de llenar los datos
-- ALTER TABLE sede 
-- ALTER COLUMN "stateProvince" SET NOT NULL,
-- ALTER COLUMN city SET NOT NULL,
-- ALTER COLUMN "addressLine" SET NOT NULL;

-- 6. Crear índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_sede_country ON sede(country);
CREATE INDEX IF NOT EXISTS idx_sede_state_province ON sede("stateProvince");
CREATE INDEX IF NOT EXISTS idx_sede_city ON sede(city);
CREATE INDEX IF NOT EXISTS idx_sede_district ON sede(district);
CREATE INDEX IF NOT EXISTS idx_sede_location ON sede(country, "stateProvince", city);
CREATE INDEX IF NOT EXISTS idx_sede_coordinates ON sede(latitude, longitude);

-- 7. Índice de texto completo para búsqueda por nombre y dirección
CREATE INDEX IF NOT EXISTS idx_sede_search ON sede USING gin(
  to_tsvector('spanish', 
    COALESCE(nombre, '') || ' ' || 
    COALESCE("addressLine", '') || ' ' || 
    COALESCE(district, '') || ' ' || 
    COALESCE(city, '')
  )
);

-- ============================================
-- Consultas útiles para verificar la migración
-- ============================================

-- Ver estructura de la tabla
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'sede' 
-- ORDER BY ordinal_position;

-- Ver índices creados
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'sede';

-- Ver datos migrados
-- SELECT "idSede", nombre, country, "stateProvince", city, district, "addressLine", latitude, longitude
-- FROM sede 
-- LIMIT 5;
