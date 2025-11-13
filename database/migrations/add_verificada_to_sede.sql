-- Agregar campo verificada a la tabla sede
-- Este campo indica si la sede ha sido verificada por el administrador

ALTER TABLE sede 
ADD COLUMN IF NOT EXISTS verificada BOOLEAN DEFAULT FALSE;

-- Actualizar sedes existentes (opcional - por defecto serán false)
-- UPDATE sede SET verificada = TRUE WHERE estado = 'Activo' AND NIT IS NOT NULL;
