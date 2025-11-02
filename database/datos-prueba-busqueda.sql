-- ================================================
-- DATOS DE PRUEBA: Búsqueda Avanzada
-- Fecha: 30 de octubre de 2025
-- ================================================

-- 1. POBLAR ZONAS EN SEDES EXISTENTES
UPDATE sede SET zona = 'Zona Sur' WHERE idSede = 1;
UPDATE sede SET zona = 'Zona Sur' WHERE idSede = 2;
UPDATE sede SET zona = 'Sopocachi' WHERE idSede = 3;
UPDATE sede SET zona = 'Centro' WHERE idSede = 4;
UPDATE sede SET zona = 'Miraflores' WHERE idSede = 5;
UPDATE sede SET zona = 'Obrajes' WHERE idSede = 6;
UPDATE sede SET zona = 'Calacoto' WHERE idSede = 7;
UPDATE sede SET zona = 'San Miguel' WHERE idSede = 8;

-- 2. VERIFICAR DISCIPLINAS (deben existir)
-- Si no existen, créalas:
INSERT INTO disciplina (nombre, categoria, descripcion) 
VALUES 
  ('Fútbol', 'Deportes de equipo', 'Fútbol 11 y 7'),
  ('Básquetbol', 'Deportes de equipo', 'Básquetbol profesional'),
  ('Tenis', 'Deportes individuales', 'Tenis de campo'),
  ('Voleibol', 'Deportes de equipo', 'Voleibol indoor y playa'),
  ('Paddle', 'Deportes de raqueta', 'Paddle tenis')
ON CONFLICT DO NOTHING;

-- 3. ASOCIAR CANCHAS CON DISCIPLINAS (tabla parte)
-- Ejemplo: Cancha 1 es de Fútbol (idDisciplina = 1)
INSERT INTO parte (idCancha, idDisciplina) 
VALUES 
  (1, 1),  -- Cancha 1 → Fútbol
  (2, 2),  -- Cancha 2 → Básquetbol
  (3, 1),  -- Cancha 3 → Fútbol
  (4, 3),  -- Cancha 4 → Tenis
  (5, 2)   -- Cancha 5 → Básquetbol
ON CONFLICT DO NOTHING;

-- 4. EJEMPLOS DE RESERVAS CON iniciaEn (sin campo fecha)
-- Estas reservas serán filtradas usando DATE(iniciaEn)
INSERT INTO reserva 
  (idCliente, idCancha, iniciaEn, terminaEn, cantidadPersonas, requiereAprobacion, 
   montoBase, montoExtra, montoTotal, estado)
VALUES
  -- Reservas para el 2 de noviembre de 2025
  (1, 1, '2025-11-02 10:00:00', '2025-11-02 11:00:00', 10, false, 150, 0, 150, 'Confirmada'),
  (2, 1, '2025-11-02 14:00:00', '2025-11-02 15:00:00', 8, false, 150, 0, 150, 'Confirmada'),
  (1, 2, '2025-11-02 18:00:00', '2025-11-02 19:00:00', 12, false, 120, 0, 120, 'Confirmada'),
  
  -- Reservas para el 5 de noviembre de 2025
  (3, 3, '2025-11-05 09:00:00', '2025-11-05 10:00:00', 10, false, 150, 0, 150, 'Pendiente'),
  (2, 5, '2025-11-05 17:00:00', '2025-11-05 18:00:00', 10, false, 180, 0, 180, 'Confirmada')
ON CONFLICT DO NOTHING;

-- ================================================
-- CONSULTAS DE PRUEBA
-- ================================================

-- Ver todas las sedes con zona
SELECT idSede, nombre, direccion, zona FROM sede WHERE zona IS NOT NULL;

-- Ver todas las canchas con sus disciplinas
SELECT c.idCancha, c.nombre, d.nombre AS disciplina, s.zona
FROM cancha c
LEFT JOIN parte p ON c.idCancha = p.idCancha
LEFT JOIN disciplina d ON p.idDisciplina = d.idDisciplina
LEFT JOIN sede s ON c."idSede" = s.idSede;

-- Ver reservas del 2 de noviembre (usando DATE(iniciaEn))
SELECT idReserva, idCancha, DATE("iniciaEn") AS fecha, 
       TO_CHAR("iniciaEn", 'HH24:MI') AS horaInicio,
       TO_CHAR("terminaEn", 'HH24:MI') AS horaFin,
       estado
FROM reserva 
WHERE DATE("iniciaEn") = '2025-11-02';
