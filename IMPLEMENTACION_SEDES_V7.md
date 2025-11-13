# 🚀 ACTUALIZACIÓN: Sistema Híbrido de Reseñas y Búsqueda por Sedes

## 📋 Resumen de Cambios

Esta actualización implementa:
1. **Relación polimórfica Foto-Sede-Cancha** (fotos pueden pertenecer a sedes o canchas)
2. **Sistema híbrido de reseñas** (CalificaSede + CalificaCancha)
3. **Nuevos endpoints públicos** para búsqueda por sedes
4. **Índices de base de datos** para optimización

---

## 🗄️ PASO 1: Ejecutar Migraciones SQL

### Opción A: pgAdmin o Cliente PostgreSQL

Ejecuta los siguientes archivos en orden:

```bash
1. database/migrations/add_foto_polimorfic_relation.sql
2. database/migrations/add_indexes_for_search.sql
3. database/migrations/create_califica_sede_table.sql
```

### Opción B: Script automatizado (RECOMENDADO)

```bash
# Navega a la carpeta del proyecto
cd /Users/enriquefernandez/Documents/6tosemestre/taller/backend-reservas

# Ejecuta el script (te pedirá usuario y nombre de BD)
./run-migrations.sh
```

### Opción C: Manualmente desde Terminal

```bash
# Navega a la carpeta del proyecto
cd /Users/enriquefernandez/Documents/6tosemestre/taller/backend-reservas

# Ejecuta cada migración (reemplaza 'postgres' con tu usuario)
psql -U postgres -d espacios_deportivos -f database/migrations/add_foto_polimorfic_relation.sql
psql -U postgres -d espacios_deportivos -f database/migrations/add_indexes_for_search.sql
psql -U postgres -d espacios_deportivos -f database/migrations/create_califica_sede_table.sql
```

**Nota:** Reemplaza `espacios_deportivos` con el nombre de tu base de datos y `postgres` con tu usuario de PostgreSQL.

---

## ✅ PASO 2: Verificar que TypeORM sincronice

Si tienes `synchronize: true` en tu configuración de TypeORM (archivo `app.module.ts`), las entities se sincronizarán automáticamente al iniciar la aplicación.

Si `synchronize: false`, necesitas ejecutar las migraciones manualmente.

---

## 🔧 Cambios en Entities

### 1. **Foto** (Polimórfica)
- ✅ Campo `tipo` ('sede' | 'cancha')
- ✅ Campo `idSede` (nullable)
- ✅ Campo `idCancha` (nullable)
- ✅ Relación con Sede
- ✅ Relación con Cancha

### 2. **Sede**
- ✅ Relación con Fotos
- ✅ Campos de rating: `ratingPromedioSede`, `totalResenasSede`, `ratingFinal`

### 3. **CalificaSede** (Nueva)
- ✅ Calificaciones de instalaciones generales
- ✅ Aspectos: atención, instalaciones, ubicación, estacionamiento, vestuarios, limpieza, seguridad

---

## 📡 Nuevos Endpoints

### **CalificaSede**

#### 1. Crear reseña de sede
```http
POST /califica-sede
Authorization: Bearer <token-cliente>

Body:
{
  "idSede": 1,
  "idReserva": 123,
  "puntajeGeneral": 5,
  "atencion": 5,
  "instalaciones": 4,
  "ubicacion": 5,
  "estacionamiento": 4,
  "vestuarios": 5,
  "limpieza": 5,
  "seguridad": 5,
  "comentario": "Excelente lugar, muy limpio y buena atención"
}
```

#### 2. Obtener reseñas de una sede
```http
GET /califica-sede/sede/:idSede
```

#### 3. Verificar si puede calificar
```http
GET /califica-sede/puede-calificar/:idSede
Authorization: Bearer <token-cliente>
```

---

### **Sedes (Públicos)**

#### 1. Detalle de sede (sin canchas)
```http
GET /sedes/:id
```

**Response:**
```json
{
  "sede": {
    "idSede": 1,
    "nombre": "Complejo Deportivo Los Pinos",
    "descripcion": "...",
    "city": "Santa Cruz",
    "stateProvince": "Santa Cruz",
    "latitude": -17.783,
    "longitude": -63.182,
    "telefono": "77712345",
    "email": "info@lospinos.com",
    "fotos": [...],
    "duenio": {...},
    "estadisticas": {
      "totalCanchas": 5,
      "deportesDisponibles": ["Fútbol", "Básquet"],
      "precioDesde": 50,
      "precioHasta": 200,
      "ratingGeneral": 4.5,
      "ratingCanchas": 4.6,
      "ratingFinal": 4.54,
      "totalResenasSede": 45,
      "totalResenasCanchas": 189
    }
  }
}
```

#### 2. Canchas de una sede
```http
GET /sedes/:id/canchas?deporte=Fútbol&precioMin=50&precioMax=200
```

**Response:**
```json
{
  "idSede": 1,
  "nombreSede": "Complejo Deportivo Los Pinos",
  "canchas": [
    {
      "idCancha": 1,
      "nombre": "Cancha Principal Fútbol 11",
      "superficie": "Césped sintético",
      "precio": 150,
      "ratingPromedio": 4.7,
      "disciplinas": [...],
      "fotos": [...]
    }
  ],
  "total": 5
}
```

---

### **Fotos (Actualizado)**

#### Crear foto de SEDE
```http
POST /fotos

Body:
{
  "tipo": "sede",
  "idSede": 1,
  "urlFoto": "https://..."
}
```

#### Crear foto de CANCHA
```http
POST /fotos

Body:
{
  "tipo": "cancha",
  "idCancha": 10,
  "urlFoto": "https://..."
}
```

---

## 🎯 Flujo de Usuario

### Cliente busca y reserva:
1. **Busca sedes** (endpoint pendiente de implementar)
2. **Ve detalle de sede**: `GET /sedes/:id`
3. **Ve canchas de la sede**: `GET /sedes/:id/canchas`
4. **Reserva una cancha**
5. **Después de la reserva:**
   - Califica la cancha: `POST /califica-cancha`
   - Califica la sede: `POST /califica-sede`

---

## 📊 Sistema de Rating Híbrido

El rating final de una sede se calcula como:

```
ratingFinal = (ratingPromedioSede × 0.4) + (promedioCanchas × 0.6)
```

**Peso:**
- CalificaSede: 40% (instalaciones generales)
- CalificaCancha: 60% (canchas específicas)

---

## ✅ Checklist de Implementación

- [x] Crear migraciones SQL
- [x] Actualizar Entity Foto (polimórfica)
- [x] Actualizar Entity Sede (ratings, fotos)
- [x] Crear Entity CalificaSede
- [x] Crear módulo CalificaSede completo
- [x] Actualizar SedeService (nuevos métodos)
- [x] Actualizar SedeController (endpoints públicos)
- [x] Actualizar FotosService (validaciones)
- [x] Actualizar FotosDTO
- [ ] **PENDIENTE: Ejecutar migraciones en BD**
- [ ] **PENDIENTE: Testing de endpoints**

---

## 🧪 Testing Manual

### 1. Probar creación de foto de sede:
```bash
POST http://localhost:3000/fotos
{
  "tipo": "sede",
  "idSede": 1,
  "urlFoto": "https://example.com/sede.jpg"
}
```

### 2. Probar detalle de sede:
```bash
GET http://localhost:3000/sedes/1
```

### 3. Probar canchas de sede:
```bash
GET http://localhost:3000/sedes/1/canchas
```

### 4. Probar calificación de sede:
```bash
POST http://localhost:3000/califica-sede
Headers: Authorization: Bearer <token-cliente>
{
  "idSede": 1,
  "idReserva": 123,
  "puntajeGeneral": 5,
  "comentario": "Excelente lugar"
}
```

---

## ⚠️ Notas Importantes

1. **Fotos antiguas:** Las fotos existentes en la BD se marcarán como `tipo='cancha'` por defecto
2. **Solo sedes activas:** Los endpoints públicos filtran por `estado='activo'`
3. **Validación de reseñas:** 
   - Solo después de reserva completada
   - Máximo 14 días después de la reserva
   - Una reseña por sede por cliente

---

## 🔄 Próximos Pasos

1. ✅ **Ejecutar migraciones**
2. ✅ **Probar endpoints manualmente**
3. ⏸️ **Implementar endpoint de búsqueda** `/sedes/buscar` (pendiente de análisis)
4. ⏸️ **Implementar panel de admin** (verificaciones)

---

## 📞 Soporte

Si encuentras algún error durante la implementación, revisa:
- Los logs del servidor NestJS
- Las validaciones de TypeORM
- Los errores de la BD

¡Éxito con la implementación! 🚀
