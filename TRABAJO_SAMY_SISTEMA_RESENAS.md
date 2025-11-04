# ⭐ TRABAJO PERSONA 2: SISTEMA DE RESEÑAS Y CALIFICACIONES

**Responsable:** Persona 2   
**Prioridad:** 🔴 CRÍTICA  

> **NOTA IMPORTANTE:** Este documento forma parte de un sistema de 4 personas:
> - **Persona 1:** Sistema de Pagos Real
> - **Persona 2:** Sistema de Reseñas y Calificaciones (este documento)
> - **Persona 3:** Perfil y Configuración de Usuario (con gestión de foto de perfil)
> - **Persona 4:** Dashboard/Panel de Análisis para Dueños

---

## 📋 RESUMEN

Implementar un **sistema completo de reseñas y calificaciones** que permita a los usuarios calificar canchas después de usarlas. Este sistema es **CRÍTICO** para la confianza de la plataforma, ya que las reseñas influyen directamente en las decisiones de reserva de otros usuarios.

**Estado actual:**
- La tabla `Resena` existe en la base de datos
- NO hay validación de que solo usuarios con reservas completadas puedan reseñar
- NO hay sistema de respuestas del dueño
- NO hay cálculo automático de rating promedio
- NO hay moderación ni reportes

**Sistema objetivo:**
- Solo usuarios con reservas **completadas** pueden dejar reseñas
- Sistema de edición y eliminación de reseñas propias
- Dueños pueden responder a reseñas
- Cálculo automático y actualización de rating promedio por cancha
- Sistema de reporte de reseñas inapropiadas
- Moderación básica

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **CRUD Completo de Reseñas**
   - Crear reseña con calificación 1-5 estrellas
   - Ver reseñas de una cancha (con paginación)
   - Editar reseña propia
   - Eliminar reseña propia

### 2. **Validación Crítica**
   - Solo usuarios con reservas **completadas** pueden reseñar
   - Un usuario solo puede dejar una reseña por cancha
   - No permitir reseñas duplicadas

### 3. **Sistema de Respuestas**
   - Dueño de la cancha puede responder a cada reseña
   - Una respuesta por reseña
   - Respuesta visible bajo la reseña original

### 4. **Cálculo de Rating**
   - Actualizar rating promedio de la cancha automáticamente
   - Mostrar distribución de calificaciones (5★: 10, 4★: 5, etc.)
   - Mostrar cantidad total de reseñas

### 5. **Sistema de Moderación**
   - Usuarios pueden reportar reseñas inapropiadas
   - Motivos de reporte predefinidos
   - Admin puede ocultar/eliminar reseñas reportadas

### 6. **Experiencia de Usuario**
   - Interfaz intuitiva para dejar reseñas
   - Visualización clara de calificaciones
   - Ordenamiento (más recientes, mejor calificadas, etc.)

---

## 📐 ARQUITECTURA DEL SISTEMA

### Flujo General de Reseña

```
┌──────────────────────────────────────────────────────────────┐
│                    USUARIO (Cliente)                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Usuario usa la cancha (reserva completada)               │
│  2. Va a "Mis Reservas"                                       │
│  3. Ve botón "Dejar Reseña" en reservas pasadas             │
│  4. Click → Modal se abre                                     │
│                                                               │
│  MODAL DE RESEÑA:                                             │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Califica tu experiencia en:                     │         │
│  │ Cancha Fútbol A                                 │         │
│  │                                                 │         │
│  │ Calificación:                                   │         │
│  │ ⭐⭐⭐⭐⭐ (seleccionable)                      │         │
│  │                                                 │         │
│  │ Cuéntanos más (opcional):                       │         │
│  │ [Textarea para comentario]                      │         │
│  │                                                 │         │
│  │ [Cancelar]  [Publicar Reseña]                  │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
              POST /api/resenas
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND - VALIDACIÓN                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ResenaService.canUserReview(idUsuario, idCancha)            │
│  ├─ Verificar que usuario tiene reserva COMPLETADA           │
│  ├─ Verificar que reserva ya pasó (fecha < hoy)             │
│  ├─ Verificar que usuario NO tiene reseña previa            │
│  └─ Si todo OK: permitir crear reseña                        │
│                                                               │
│  Si validación pasa:                                          │
│  ├─ Crear registro en tabla Resena                           │
│  ├─ Recalcular rating promedio de la cancha                  │
│  ├─ Actualizar campo ratingPromedio en tabla Cancha          │
│  └─ Notificar al dueño (opcional)                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    VISUALIZACIÓN                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  FieldDetailPage:                                             │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Cancha Fútbol A                                 │         │
│  │ ⭐⭐⭐⭐⭐ 4.8 (23 reseñas)                     │         │
│  │                                                 │         │
│  │ Distribución:                                   │         │
│  │ 5★ ████████████████████░░ 18                   │         │
│  │ 4★ ██████░░░░░░░░░░░░░░░░ 4                    │         │
│  │ 3★ █░░░░░░░░░░░░░░░░░░░░░ 1                    │         │
│  │ 2★ ░░░░░░░░░░░░░░░░░░░░░░ 0                    │         │
│  │ 1★ ░░░░░░░░░░░░░░░░░░░░░░ 0                    │         │
│  │                                                 │         │
│  │ Reseñas:                                        │         │
│  │ ┌───────────────────────────────────────┐      │         │
│  │ │ ⭐⭐⭐⭐⭐                             │      │         │
│  │ │ Juan Pérez • 28 Oct 2024             │      │         │
│  │ │ "Excelente cancha, muy limpia..."    │      │         │
│  │ │                                       │      │         │
│  │ │ 💬 Respuesta del dueño:              │      │         │
│  │ │ "Gracias por tu comentario!"         │      │         │
│  │ │                                       │      │         │
│  │ │ [Reportar] [Útil (5)]                │      │         │
│  │ └───────────────────────────────────────┘      │         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗄️ BACKEND - ESTRUCTURA Y ENDPOINTS

### 1. BASE DE DATOS - Modificaciones y Nuevas Tablas

#### 1.1 Modificar tabla Resena existente

**Objetivo:** Agregar campos faltantes para funcionalidad completa.

**La tabla actual tiene:**
- idResena
- idCancha
- idUsuario
- calificacion (1-5)
- comentario
- fechaResena

**Agregar campos:**
- `editadoEn`: TIMESTAMP NULL (fecha de última edición)
- `reportada`: BOOLEAN DEFAULT FALSE (si fue reportada)
- `motivoReporte`: TEXT NULL (razón del reporte)
- `estado`: ENUM('ACTIVA', 'OCULTA', 'ELIMINADA') DEFAULT 'ACTIVA'
- `utilVotos`: INT DEFAULT 0 (cuántos usuarios marcaron como útil)

**Índices a crear:**
- Por `idCancha` (buscar reseñas de una cancha) - puede ya existir
- Por `idUsuario` (buscar reseñas de un usuario)
- Por `estado` (filtrar reseñas activas)
- Por `calificacion` (ordenar por rating)
- Por `fechaResena` DESC (mostrar más recientes primero)

---

#### 1.2 Crear tabla RespuestaResena

**Objetivo:** Permitir que dueños respondan a reseñas.

**Campos:**
- `idRespuesta`: INT PRIMARY KEY AUTO_INCREMENT
- `idResena`: INT NOT NULL (FK a Resena)
- `idDueno`: INT NOT NULL (FK a Usuario, debe ser dueño de la cancha)
- `respuesta`: TEXT NOT NULL
- `creadoEn`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `editadoEn`: TIMESTAMP NULL

**Índices:**
- Por `idResena` UNIQUE (una respuesta por reseña)
- Por `idDueno`

**Foreign Keys:**
- idResena → Resena.idResena (ON DELETE CASCADE)
- idDueno → Usuario.idUsuario

---

#### 1.3 Crear tabla ReporteResena

**Objetivo:** Registrar reportes de usuarios sobre reseñas inapropiadas.

**Campos:**
- `idReporte`: INT PRIMARY KEY AUTO_INCREMENT
- `idResena`: INT NOT NULL (FK a Resena)
- `idUsuarioReportador`: INT NOT NULL (quién reporta)
- `motivo`: ENUM(
    'SPAM',
    'LENGUAJE_OFENSIVO',
    'CONTENIDO_INAPROPIADO',
    'FALSA',
    'OTRO'
  ) NOT NULL
- `descripcion`: TEXT NULL (detalles adicionales)
- `estado`: ENUM('PENDIENTE', 'REVISADO', 'RECHAZADO') DEFAULT 'PENDIENTE'
- `creadoEn`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `revisadoEn`: TIMESTAMP NULL
- `idAdminRevisor`: INT NULL (admin que revisó)

**Índices:**
- Por `idResena` (ver todos los reportes de una reseña)
- Por `estado` (reportes pendientes)
- Por `idUsuarioReportador` (evitar spam de reportes)

---

#### 1.4 Actualizar tabla Cancha

**Verificar campos de rating:**

La tabla `Cancha` debe tener:
- `ratingPromedio`: DECIMAL(2,1) DEFAULT 0.0 (ej. 4.8)
- `totalResenas`: INT DEFAULT 0 (cantidad de reseñas)

Si no existen, agregarlos.

**Importante:** Estos campos se actualizan automáticamente cada vez que se crea, edita o elimina una reseña.

---

### 2. SERVICIO DE VALIDACIÓN - ResenaService.canUserReview()

**Objetivo:** Verificar si un usuario PUEDE dejar una reseña en una cancha.

**Esta es la función MÁS CRÍTICA del sistema.**

**Lógica de validación:**

1. **Verificar que el usuario tiene al menos una reserva:**
   - En la cancha especificada
   - Con estado = 'Completada' o 'Cancelada' (solo Completada debería contar)
   - WHERE idCliente = idUsuario AND idCancha = idCancha

2. **Verificar que la reserva ya pasó:**
   - La fecha de la reserva debe ser anterior a HOY
   - No permitir reseñar reservas futuras

3. **Verificar que NO tiene reseña previa:**
   - Un usuario solo puede dejar UNA reseña por cancha
   - SELECT FROM Resena WHERE idUsuario = X AND idCancha = Y
   - Si ya existe: retornar error "Ya dejaste una reseña en esta cancha"

4. **Si todas las validaciones pasan:**
   - Retornar true
   - Permitir crear la reseña

**Query sugerido:**
```
Buscar si existe reserva:
- JOIN Reserva con Cliente
- WHERE cliente.persona.usuario.idUsuario = idUsuario
- AND reserva.idCancha = idCancha
- AND reserva.estado = 'Completada'
- AND reserva.fecha < HOY

Si existe al menos una Y no hay reseña previa → OK
```

---

### 3. SERVICIO DE RESEÑAS - Operaciones CRUD

#### 3.1 Crear Reseña

**Endpoint:** `POST /api/resenas`

**Flujo:**

1. **Recibir datos:**
   - idCancha
   - calificacion (1-5)
   - comentario (opcional, max 500 caracteres)

2. **Obtener idUsuario del token JWT**

3. **Validar con canUserReview():**
   - Si retorna false: error 403 "No puedes reseñar esta cancha"

4. **Validar calificación:**
   - Debe ser entre 1 y 5
   - Debe ser número entero

5. **Validar comentario:**
   - Máximo 500 caracteres
   - Opcional (puede estar vacío)
   - Sanitizar HTML/scripts

6. **Crear registro en Resena:**
   - idCancha, idUsuario, calificacion, comentario
   - fechaResena: NOW()
   - estado: ACTIVA

7. **Recalcular rating de la cancha:**
   - SELECT AVG(calificacion) FROM Resena WHERE idCancha = X AND estado = 'ACTIVA'
   - SELECT COUNT(*) FROM Resena WHERE idCancha = X AND estado = 'ACTIVA'
   - UPDATE Cancha SET ratingPromedio = avg, totalResenas = count

8. **Retornar reseña creada**

---

#### 3.2 Obtener Reseñas de una Cancha

**Endpoint:** `GET /api/canchas/:idCancha/resenas`

**Query params:**
- `page`: número de página (default: 1)
- `limit`: resultados por página (default: 10)
- `ordenar`: 'recientes' | 'mejores' | 'peores' (default: recientes)

**Flujo:**

1. **Buscar reseñas:**
   - WHERE idCancha = X
   - AND estado = 'ACTIVA'
   - ORDENAR según parámetro

2. **Incluir datos del usuario:**
   - Nombre del usuario
   - Foto de perfil
   - JOIN con Usuario y Persona

3. **Incluir respuesta del dueño (si existe):**
   - LEFT JOIN con RespuestaResena

4. **Calcular distribución:**
   - COUNT de reseñas con calificacion = 5
   - COUNT de reseñas con calificacion = 4
   - ... hasta 1

5. **Paginación:**
   - LIMIT y OFFSET
   - Retornar total de páginas

6. **Retornar objeto:**
   ```
   {
     ratingPromedio: 4.8,
     totalResenas: 23,
     distribucion: {
       5: 18,
       4: 4,
       3: 1,
       2: 0,
       1: 0
     },
     resenas: [...],
     paginacion: {
       pagina: 1,
       limite: 10,
       total: 23,
       totalPaginas: 3
     }
   }
   ```

---

#### 3.3 Editar Reseña Propia

**Endpoint:** `PUT /api/resenas/:id`

**Flujo:**

1. **Obtener idUsuario del token**

2. **Buscar reseña por ID:**
   - Si no existe: error 404

3. **Verificar propiedad:**
   - Si resena.idUsuario !== idUsuario: error 403 "No es tu reseña"

4. **Validar nuevos datos:**
   - Calificación entre 1-5
   - Comentario máx 500 chars

5. **Actualizar:**
   - calificacion (si cambió)
   - comentario (si cambió)
   - editadoEn = NOW()

6. **Si cambió la calificación:**
   - Recalcular rating promedio de la cancha

7. **Retornar reseña actualizada**

---

#### 3.4 Eliminar Reseña Propia

**Endpoint:** `DELETE /api/resenas/:id`

**Flujo:**

1. **Verificar propiedad** (igual que editar)

2. **Soft delete o hard delete:**
   - **Opción 1 (recomendado):** Soft delete
     - UPDATE estado = 'ELIMINADA'
     - Mantener registro para auditoría
   - **Opción 2:** Hard delete
     - DELETE FROM Resena

3. **Recalcular rating de la cancha:**
   - Sin contar la reseña eliminada

4. **Eliminar respuesta del dueño (si existe):**
   - CASCADE debería hacerlo automáticamente

5. **Retornar éxito**

---

### 4. SISTEMA DE RESPUESTAS DEL DUEÑO

#### 4.1 Responder a una Reseña

**Endpoint:** `POST /api/resenas/:id/responder`

**Flujo:**

1. **Obtener idUsuario del token**

2. **Verificar que usuario es DUEÑO:**
   - rol = 'DUENO'

3. **Buscar la reseña:**
   - Si no existe: error 404

4. **Verificar que la cancha es del dueño:**
   - SELECT idUsuario FROM Cancha WHERE idCancha = resena.idCancha
   - Si no es el dueño: error 403

5. **Verificar que NO hay respuesta previa:**
   - SELECT FROM RespuestaResena WHERE idResena = X
   - Si ya existe: error 400 "Ya respondiste a esta reseña"

6. **Validar respuesta:**
   - Máximo 500 caracteres
   - No vacío

7. **Crear registro en RespuestaResena:**
   - idResena
   - idDueno
   - respuesta
   - creadoEn = NOW()

8. **Retornar respuesta creada**

---

#### 4.2 Editar Respuesta

**Endpoint:** `PUT /api/resenas/:idResena/responder`

**Flujo similar a crear, pero UPDATE en lugar de INSERT.**

Validar:
- Que la respuesta existe
- Que el usuario es el dueño que la creó
- Actualizar `editadoEn`

---

#### 4.3 Eliminar Respuesta

**Endpoint:** `DELETE /api/resenas/:idResena/responder`

**Flujo:**
- Verificar propiedad
- DELETE FROM RespuestaResena

---

### 5. SISTEMA DE REPORTES

#### 5.1 Reportar Reseña

**Endpoint:** `POST /api/resenas/:id/reportar`

**Flujo:**

1. **Obtener idUsuario del token**

2. **Validar que la reseña existe**

3. **Validar que no es el autor:**
   - No permitir reportar tu propia reseña

4. **Verificar si ya reportó:**
   - SELECT FROM ReporteResena WHERE idResena = X AND idUsuarioReportador = idUsuario
   - Si ya reportó: error "Ya reportaste esta reseña"

5. **Recibir datos:**
   - motivo (enum)
   - descripcion (opcional)

6. **Crear registro en ReporteResena:**
   - estado: PENDIENTE

7. **Si hay X reportes (ej. 3):**
   - UPDATE Resena SET reportada = TRUE
   - Opcional: ocultar automáticamente

8. **Retornar éxito**

---

#### 5.2 Obtener Reportes (Admin/Dueño)

**Endpoint:** `GET /api/reportes/resenas`

**Solo accesible por Admin o Dueño**

**Flujo:**
- Listar reportes con estado PENDIENTE
- Incluir datos de la reseña reportada
- Incluir datos del reportador
- Paginación

---

#### 5.3 Moderar Reporte (Admin)

**Endpoint:** `PUT /api/reportes/:id`

**Acciones posibles:**
- Marcar como revisado
- Ocultar la reseña
- Eliminar la reseña
- Rechazar el reporte (reseña es válida)

---

### 6. CÁLCULO AUTOMÁTICO DE RATING

**Función:** `calcularRatingPromedio(idCancha)`

**Cuándo ejecutar:**
- Al crear nueva reseña
- Al editar reseña (si cambió calificación)
- Al eliminar reseña
- Al ocultar/mostrar reseña

**Lógica:**

1. **Calcular promedio:**
   ```
   SELECT AVG(calificacion) as promedio
   FROM Resena
   WHERE idCancha = X
   AND estado = 'ACTIVA'
   ```

2. **Contar total:**
   ```
   SELECT COUNT(*) as total
   FROM Resena
   WHERE idCancha = X
   AND estado = 'ACTIVA'
   ```

3. **Actualizar Cancha:**
   ```
   UPDATE Cancha
   SET ratingPromedio = promedio,
       totalResenas = total
   WHERE idCancha = X
   ```

**Importante:** Siempre redondear a 1 decimal (ej. 4.8, no 4.83).

---

### 7. ENDPOINTS RESUMEN

#### Reseñas
```
POST   /api/resenas                    - Crear reseña
GET    /api/resenas/:id                - Obtener una reseña
PUT    /api/resenas/:id                - Editar reseña propia
DELETE /api/resenas/:id                - Eliminar reseña propia
GET    /api/canchas/:id/resenas        - Obtener reseñas de cancha (paginado)
GET    /api/usuarios/:id/resenas       - Obtener reseñas de un usuario
```

#### Respuestas
```
POST   /api/resenas/:id/responder      - Responder reseña (dueño)
PUT    /api/resenas/:id/responder      - Editar respuesta
DELETE /api/resenas/:id/responder      - Eliminar respuesta
```

#### Reportes
```
POST   /api/resenas/:id/reportar       - Reportar reseña
GET    /api/reportes/resenas           - Ver reportes (admin/dueño)
PUT    /api/reportes/:id               - Moderar reporte (admin)
```

#### Utilidad
```
POST   /api/resenas/:id/util           - Marcar reseña como útil
GET    /api/resenas/validar-permiso    - Verificar si puede reseñar cancha
```

---

## 🎨 FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. MÓDULO DE RESEÑAS

**Estructura de carpetas:**
```
src/modules/reviews/
  components/
    CreateReviewModal.tsx         # Modal para crear reseña ⭐
    EditReviewModal.tsx           # Modal para editar
    ReviewList.tsx                # Lista de reseñas con paginación
    ReviewCard.tsx                # Card individual de reseña
    StarRating.tsx                # Componente de estrellas (display y input)
    RatingDistribution.tsx        # Gráfico de distribución
    OwnerResponse.tsx             # Respuesta del dueño
    RespondModal.tsx              # Modal para dueño responder
    ReportModal.tsx               # Modal para reportar reseña
  services/
    reviewService.ts              # Llamadas a API
  types/
    review.types.ts               # Tipos TypeScript
  hooks/
    useReviews.ts                 # Hook para gestionar reseñas
    useCanReview.ts               # Hook para validar permiso
```

---

### 2. COMPONENTE CREATEREVIEWMODAL

**Objetivo:** Modal para que usuario deje una reseña.

**Props:**
- `idCancha`: number
- `nombreCancha`: string
- `onSuccess`: callback cuando se crea exitosamente
- `onClose`: callback para cerrar

**Funcionalidades:**

1. **Estado local:**
   - calificacion: number (1-5)
   - comentario: string
   - loading: boolean
   - error: string | null

2. **Star Rating interactivo:**
   - 5 estrellas clickeables
   - Hover preview (iluminar estrellas al pasar mouse)
   - Click para seleccionar
   - Visual feedback de selección

3. **Textarea para comentario:**
   - Placeholder: "Cuéntanos sobre tu experiencia..."
   - Contador de caracteres: "125/500"
   - Opcional, puede dejarse vacío
   - Auto-resize a medida que escribe

4. **Validación:**
   - Calificación es obligatoria
   - No permitir submit sin calificación
   - Comentario máximo 500 caracteres

5. **Submit:**
   - Loading state: "Publicando..."
   - Deshabilitar botón durante submit
   - POST /api/resenas
   - Si éxito: cerrar modal y mostrar mensaje
   - Si error: mostrar mensaje de error

6. **UI:**
   ```
   ┌─────────────────────────────────────────────┐
   │ 📝 Deja tu reseña                           │
   │ Cancha Fútbol A                             │
   ├─────────────────────────────────────────────┤
   │                                             │
   │ Tu calificación *                           │
   │ ⭐⭐⭐⭐☆ (4 estrellas)                    │
   │                                             │
   │ Tu opinión (opcional)                       │
   │ ┌─────────────────────────────────────┐    │
   │ │ Excelente cancha, muy limpia...     │    │
   │ │                                     │    │
   │ └─────────────────────────────────────┘    │
   │ 125/500 caracteres                          │
   │                                             │
   │ [Cancelar]      [Publicar Reseña] ✓        │
   └─────────────────────────────────────────────┘
   ```

---

### 3. COMPONENTE STARRATING

**Objetivo:** Componente reutilizable para mostrar/seleccionar estrellas.

**Dos modos:**

**Modo display (solo lectura):**
```typescript
<StarRating value={4.8} readonly />
```
Muestra 4.8 estrellas (4 completas, 1 a 80%)

**Modo input (seleccionable):**
```typescript
<StarRating 
  value={rating} 
  onChange={(newRating) => setRating(newRating)} 
/>
```

**Funcionalidades:**
- Hover: iluminar estrellas al pasar mouse
- Click: seleccionar calificación
- Mostrar número al lado: "4.8"
- Colores: amarillo para llenas, gris para vacías
- Animación suave al cambiar

**Iconos:** Usar librería de íconos (lucide-react tiene Star y StarHalf)

---

### 4. COMPONENTE REVIEWLIST

**Objetivo:** Listar todas las reseñas de una cancha con paginación.

**Props:**
- `idCancha`: number
- `permitirReportar`: boolean (opcional)

**Funcionalidades:**

1. **Header con resumen:**
   ```
   ⭐ 4.8 (23 reseñas)
   
   Distribución:
   5★ ████████████████████░░ 18 (78%)
   4★ ██████░░░░░░░░░░░░░░░░ 4 (17%)
   3★ █░░░░░░░░░░░░░░░░░░░░░ 1 (4%)
   2★ ░░░░░░░░░░░░░░░░░░░░░░ 0 (0%)
   1★ ░░░░░░░░░░░░░░░░░░░░░░ 0 (0%)
   ```

2. **Controles de ordenamiento:**
   ```
   Ordenar por: [Más recientes ▼] [Mejor valoradas] [Peor valoradas]
   ```

3. **Lista de ReviewCard:**
   - Mapear cada reseña a un ReviewCard
   - Mostrar máximo 10 por página

4. **Paginación:**
   - Botones: ← Anterior | Siguiente →
   - Indicador: "Página 1 de 3"

5. **Estado vacío:**
   - Si no hay reseñas: mensaje "Sé el primero en dejar una reseña"

6. **Loading:**
   - Skeletons mientras carga

---

### 5. COMPONENTE REVIEWCARD

**Objetivo:** Card de una reseña individual con toda la info.

**Props:**
- `review`: objeto con datos de reseña
- `mostrarAcciones`: boolean (editar, eliminar para reseñas propias)
- `esResena`: boolean (si es dueño, mostrar botón responder)

**UI:**
```
┌──────────────────────────────────────────────────┐
│ [Avatar] Juan Pérez                              │
│          ⭐⭐⭐⭐⭐ 5 estrellas                 │
│          28 de octubre de 2024                   │
│                                                  │
│ "Excelente cancha! Muy limpia y bien mantenida. │
│  El césped está en perfectas condiciones."      │
│                                                  │
│ 💬 Respuesta del dueño:                          │
│    "¡Gracias por tu comentario! Nos esforzamos  │
│     por mantener todo en óptimas condiciones."  │
│    • Hace 2 días                                 │
│                                                  │
│ [👍 Útil (5)] [🚩 Reportar]  [✏️ Editar] [🗑️ Eliminar]│
└──────────────────────────────────────────────────┘
```

**Condicionales:**
- Botones Editar/Eliminar: solo si es reseña del usuario actual
- Botón Responder: solo si es dueño y no hay respuesta
- Botón Reportar: solo si NO es reseña propia
- Respuesta del dueño: solo si existe

---

### 6. COMPONENTE RATINGDISTRIBUTION

**Objetivo:** Mostrar gráfico de barras con distribución de calificaciones.

**Props:**
- `distribucion`: objeto { 5: 18, 4: 4, 3: 1, 2: 0, 1: 0 }
- `total`: number

**UI:**
```
Calificaciones:

5★ ████████████████████░░░░ 18 (78%)
4★ ██████░░░░░░░░░░░░░░░░░░ 4 (17%)
3★ █░░░░░░░░░░░░░░░░░░░░░░░ 1 (4%)
2★ ░░░░░░░░░░░░░░░░░░░░░░░░ 0 (0%)
1★ ░░░░░░░░░░░░░░░░░░░░░░░░ 0 (0%)
```

**Implementación:**
- Calcular % para cada calificación
- Ancho de barra proporcional al %
- Color: verde para 5-4, amarillo para 3, rojo para 2-1
- Mostrar número absoluto y %

---

### 7. INTEGRACIÓN EN FIELDETAILPAGE

**Ubicación:** Ya existe `src/modules/fields/pages/FieldDetailPage.tsx`

**Agregar sección de reseñas:**

1. **Después de la descripción y horarios:**
   ```typescript
   {/* Reseñas */}
   <section className="mt-8">
     <h2>Reseñas y Calificaciones</h2>
     <ReviewList idCancha={idCancha} />
   </section>
   ```

2. **Mostrar rating en header:**
   ```typescript
   <div className="flex items-center gap-2">
     <StarRating value={cancha.ratingPromedio} readonly />
     <span className="text-gray-600">
       ({cancha.totalResenas} reseñas)
     </span>
   </div>
   ```

---

### 8. INTEGRACIÓN EN MYBOOKINGSPAGE

**Ubicación:** Ya existe `src/modules/bookings/pages/MyBookingsPage.tsx`

**Agregar botón "Dejar Reseña":**

1. **En cada reserva COMPLETADA:**
   - Verificar que fecha < HOY
   - Verificar que estado = 'Completada'
   - Verificar que NO tiene reseña

2. **Botón:**
   ```typescript
   {puedeResenar && (
     <button 
       onClick={() => setMostrarModal(true)}
       className="btn btn-primary"
     >
       ⭐ Dejar Reseña
     </button>
   )}
   ```

3. **Modal:**
   ```typescript
   {mostrarModal && (
     <CreateReviewModal
       idCancha={reserva.idCancha}
       nombreCancha={reserva.cancha.nombre}
       onSuccess={() => {
         // Cerrar modal
         // Actualizar UI
         // Mostrar mensaje de éxito
       }}
       onClose={() => setMostrarModal(false)}
     />
   )}
   ```

---

### 9. SERVICIO FRONTEND

**reviewService.ts:**

```typescript
// Tipos de ejemplo
interface CreateReviewDTO {
  idCancha: number;
  calificacion: number;
  comentario?: string;
}

interface Review {
  idResena: number;
  idCancha: number;
  idUsuario: number;
  usuario: {
    nombre: string;
    fotoPerfil: string;
  };
  calificacion: number;
  comentario: string;
  fechaResena: string;
  editadoEn?: string;
  respuesta?: {
    idRespuesta: number;
    respuesta: string;
    creadoEn: string;
  };
}

// Funciones
createReview(data: CreateReviewDTO): Promise<Review>
updateReview(id: number, data: Partial<CreateReviewDTO>): Promise<Review>
deleteReview(id: number): Promise<void>
getReviewsByCancha(idCancha: number, page: number): Promise<ReviewListResponse>
canUserReview(idCancha: number): Promise<boolean>
reportReview(id: number, motivo: string, descripcion?: string): Promise<void>
markAsUseful(id: number): Promise<void>
respondToReview(idResena: number, respuesta: string): Promise<Response>
```

---

### 10. HOOK PERSONALIZADO

**useCanReview.ts:**

**Objetivo:** Verificar si el usuario puede reseñar una cancha.

```typescript
export function useCanReview(idCancha: number) {
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const result = await reviewService.canUserReview(idCancha);
        setCanReview(result.canReview);
        setReason(result.reason);
      } catch (error) {
        setCanReview(false);
      } finally {
        setLoading(false);
      }
    }
    
    check();
  }, [idCancha]);

  return { canReview, loading, reason };
}
```

**Uso:**
```typescript
const { canReview, loading, reason } = useCanReview(idCancha);

if (loading) return <Spinner />;

if (canReview) {
  return <button>Dejar Reseña</button>;
} else {
  return <p>{reason}</p>; // "No tienes reservas en esta cancha"
}
```

---

## 🧪 TESTING

### Backend

**Tests de validación:**

1. **canUserReview():**
   - Usuario con reserva completada: ✅ puede reseñar
   - Usuario con reserva futura: ❌ no puede
   - Usuario sin reservas: ❌ no puede
   - Usuario que ya reseñó: ❌ no puede reseñar de nuevo

2. **Crear reseña:**
   - Con validación pasada: ✅ se crea
   - Sin validación: ❌ error 403
   - Calificación inválida: ❌ error 400
   - Rating de cancha se actualiza correctamente

3. **Editar reseña:**
   - Autor puede editar: ✅
   - Otro usuario no puede: ❌ error 403
   - Rating se recalcula si cambia calificación

4. **Responder:**
   - Dueño puede responder: ✅
   - Cliente no puede: ❌ error 403
   - Solo una respuesta por reseña

5. **Reportar:**
   - Usuario puede reportar reseña ajena: ✅
   - No puede reportar propia: ❌ error 400
   - No puede reportar dos veces: ❌ error 400

---

### Frontend

**Tests de componentes:**

1. **StarRating:**
   - Muestra rating correctamente
   - Modo input permite seleccionar
   - Hover funciona
   - OnChange dispara callback

2. **CreateReviewModal:**
   - Validación de calificación obligatoria
   - Contador de caracteres funciona
   - Submit exitoso cierra modal
   - Error muestra mensaje

3. **ReviewList:**
   - Muestra reseñas correctamente
   - Paginación funciona
   - Ordenamiento funciona
   - Estado vacío se muestra

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Modificar tabla Resena (campos adicionales)
- [ ] Crear tabla RespuestaResena
- [ ] Crear tabla ReporteResena
- [ ] Verificar campos de rating en tabla Cancha
- [ ] Crear índices necesarios
- [ ] Scripts SQL documentados

### Backend - Servicios
- [ ] ResenaService.canUserReview() ⭐ CRÍTICO
- [ ] ResenaService.create()
- [ ] ResenaService.update()
- [ ] ResenaService.delete()
- [ ] ResenaService.getByCancha()
- [ ] ResenaService.calcularRatingPromedio()
- [ ] RespuestaService.create()
- [ ] RespuestaService.update()
- [ ] RespuestaService.delete()
- [ ] ReporteService.create()
- [ ] ReporteService.list()
- [ ] ReporteService.moderar()

### Backend - Controladores
- [ ] ResenaController - POST /api/resenas
- [ ] ResenaController - PUT /api/resenas/:id
- [ ] ResenaController - DELETE /api/resenas/:id
- [ ] ResenaController - GET /api/canchas/:id/resenas
- [ ] ResenaController - POST /api/resenas/:id/responder
- [ ] ResenaController - POST /api/resenas/:id/reportar
- [ ] ResenaController - GET /api/resenas/validar-permiso

### Backend - Validaciones
- [ ] Validar permisos (solo autor puede editar/eliminar)
- [ ] Validar propiedad de cancha (dueño puede responder)
- [ ] Validar calificación 1-5
- [ ] Validar longitud de comentario
- [ ] Prevenir duplicados
- [ ] Sanitizar HTML en comentarios

### Frontend - Componentes
- [ ] StarRating (display y input)
- [ ] CreateReviewModal
- [ ] EditReviewModal
- [ ] ReviewList
- [ ] ReviewCard
- [ ] RatingDistribution
- [ ] OwnerResponse
- [ ] RespondModal
- [ ] ReportModal

### Frontend - Servicios
- [ ] reviewService.ts completo
- [ ] Manejo de errores
- [ ] Loading states

### Frontend - Hooks
- [ ] useReviews
- [ ] useCanReview

### Integración
- [ ] Agregar reseñas a FieldDetailPage
- [ ] Agregar botón "Dejar Reseña" en MyBookingsPage
- [ ] Mostrar rating en cards de canchas
- [ ] Dashboard del dueño muestra reseñas (Persona 4 lo usa)

### Testing
- [ ] Test validación canUserReview()
- [ ] Test crear reseña
- [ ] Test editar/eliminar propia reseña
- [ ] Test no poder editar reseña ajena
- [ ] Test responder como dueño
- [ ] Test no poder responder como cliente
- [ ] Test reportar reseña
- [ ] Test cálculo de rating promedio
- [ ] Test componentes frontend

---

## 📚 RECURSOS Y REFERENCIAS

### Librerías Recomendadas

**Frontend:**
- `react-rating-stars-component` - Componente de estrellas
- O implementar custom con lucide-react (Star, StarHalf icons)
- `react-textarea-autosize` - Textarea que crece automáticamente

### Validación
- Luhn algorithm para validar datos (no aplica aquí, pero referencia)
- Sanitización HTML: usar DOMPurify si necesario

### UX Referencias
- Airbnb reviews
- TripAdvisor
- Google Maps reviews

---

**Fecha inicio:** ___________  
**Fecha fin:** ___________  
**Responsable:** ___________
