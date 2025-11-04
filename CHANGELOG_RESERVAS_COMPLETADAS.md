# 📋 Cambios en Sistema de Reservas - Completadas y Reseñas

**Fecha:** 3 de noviembre de 2025  
**Versión:** 1.1.0  
**Rama:** dev

---

## 🎯 Resumen de Cambios

Se implementó el sistema de **reservas completadas** para controlar el período de 14 días en el que los clientes pueden dejar reseñas. Ahora las reservas deben ser marcadas como "completadas" manualmente o automáticamente después de su uso.

---

## 🆕 Nuevos Endpoints

### 1. Completar una Reserva (Manual)

```http
PATCH /reservas/:id/completar
```

**Autenticación:** Requerida (Admin, Dueño)

**Respuesta Exitosa (200):**
```json
{
  "message": "Reserva completada exitosamente",
  "reserva": {
    "idReserva": 123,
    "completadaEn": "2025-11-03T15:30:00.000Z",
    "periodoResena": {
      "inicio": "2025-11-03T15:30:00.000Z",
      "fin": "2025-11-17T15:30:00.000Z",
      "diasRestantes": 14
    }
  }
}
```

**Errores Posibles:**
- `404` - Reserva no encontrada
- `400` - Reserva ya cancelada
- `409` - Reserva ya completada

---

### 2. Completar Reservas Automáticas (Batch)

```http
POST /reservas/completar-automaticas
```

**Autenticación:** Requerida (Solo Admin)

**Descripción:** Completa todas las reservas confirmadas cuya hora de término ya pasó.

**Respuesta Exitosa (200):**
```json
{
  "message": "5 reserva(s) completada(s) automáticamente",
  "cantidad": 5,
  "reservas": [
    {
      "idReserva": 120,
      "terminaEn": "2025-11-02T18:00:00.000Z",
      "completadaEn": "2025-11-02T18:00:00.000Z"
    }
  ]
}
```

---

### 3. 🧪 Simular Uso de Reserva (DEV/Testing)

```http
POST /reservas/:id/simular-uso
```

**Autenticación:** NO requerida (público para testing)

**Descripción:** Simula todo el flujo de uso de una reserva: confirmación → QR entrada → uso → QR salida → completada. **Útil para desarrollo y testing del frontend.**

**Respuesta Exitosa (200):**
```json
{
  "message": "✅ Reserva simulada exitosamente (DEV)",
  "simulacion": {
    "pasos": [
      "1. ✓ Reserva confirmada",
      "2. ✓ Cliente llegó a la cancha (QR escaneado)",
      "3. ✓ Cliente usó la cancha",
      "4. ✓ Cliente salió (QR escaneado)",
      "5. ✓ Reserva marcada como completada"
    ],
    "advertencia": "⚠️ Este endpoint es SOLO para desarrollo/testing"
  },
  "reserva": {
    "idReserva": 123,
    "estado": "Confirmada",
    "completadaEn": "2025-11-03T16:45:00.000Z",
    "cliente": {
      "idCliente": 5,
      "nombre": "Cliente #5"
    },
    "cancha": {
      "idCancha": 2,
      "nombre": "Cancha Fútbol A"
    },
    "periodoResena": {
      "inicio": "2025-11-03T16:45:00.000Z",
      "fin": "2025-11-17T16:45:00.000Z",
      "diasRestantes": 14
    }
  },
  "proximoPaso": {
    "mensaje": "Ahora el cliente puede dejar una reseña",
    "endpoint": "POST /califica-cancha",
    "diasDisponibles": 14
  }
}
```

**Uso recomendado:**
1. Crea una reserva nueva con `POST /reservas`
2. Llama a `POST /reservas/:id/simular-uso` inmediatamente
3. Ya puedes probar el flujo de reseñas con `POST /califica-cancha`

**⚠️ Nota:** Este endpoint **NO debe usarse en producción**. Solo para desarrollo local.

---

## 🔄 Cambios en Endpoints Existentes

### GET /reservas/:id

**Nuevo campo en respuesta:**
```json
{
  "idReserva": 123,
  "estado": "Confirmada",
  "completadaEn": "2025-11-03T15:30:00.000Z",  // ⭐ NUEVO
  ...
}
```

**Valores posibles de `completadaEn`:**
- `null` - Reserva no completada aún
- `"2025-11-03T15:30:00.000Z"` - Fecha y hora en que se completó

---

### GET /reservas/usuario/:idUsuario

**Nuevo campo en respuesta:**
```json
[
  {
    "idReserva": 6,
    "fecha": "2025-11-06",
    "horaInicio": "19:00:00",
    "horaFin": "20:00:00",
    "estado": "Confirmada",
    "completadaEn": null,  // ⭐ NUEVO
    "cancha": { ... },
    "montoTotal": 20,
    "cantidadPersonas": 1
  }
]
```

---

### GET /reservas/cancha/:idCancha

**Nuevo campo en respuesta:** `completadaEn`

---

### GET /reservas/cancha/:idCancha?fecha=YYYY-MM-DD

**Nuevo campo en respuesta:** `completadaEn`

---

### POST /califica-cancha/validar

**Cambio de comportamiento:**

Ahora valida usando `completadaEn` en lugar de `terminaEn` para calcular los 14 días.

**Antes:**
```
✅ Puede reseñar si: terminaEn <= ahora <= terminaEn + 14 días
```

**Ahora:**
```
✅ Puede reseñar si: completadaEn existe Y completadaEn <= ahora <= completadaEn + 14 días
```

**Respuesta si NO está completada:**
```json
{
  "puedeResenar": false,
  "razon": "La reserva aún no ha sido completada"
}
```

---

### GET /califica-cancha/pendientes

**Cambio de comportamiento:**

Ahora busca reservas con `completadaEn IS NOT NULL` en lugar de `estado = 'Completada'`.

**Nuevo campo en respuesta:**
```json
[
  {
    "idReserva": 123,
    "completadaEn": "2025-11-03T15:30:00.000Z",  // ⭐ Reemplaza terminaEn
    "diasRestantes": 12,
    "fechaLimite": "2025-11-17T15:30:00.000Z",
    ...
  }
]
```

---

## 🗂️ Cambios en Modelo de Datos

### Tabla `reserva`

**Nueva columna:**

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| `completadaEn` | `timestamp` | `true` | Fecha y hora en que se completó la reserva |

**Estados se mantienen igual:**
- `Pendiente`
- `Confirmada`
- `Cancelada`

---

## 🔀 Flujo de Reservas Actualizado

```
1. Cliente crea reserva
   └─> estado: "Pendiente", completadaEn: null

2. Dueño/Admin confirma
   └─> estado: "Confirmada", completadaEn: null

3. Cliente usa la cancha
   └─> (Sin cambios en la BD)

4. Dueño/Admin completa la reserva ⭐ NUEVO PASO
   └─> PATCH /reservas/:id/completar
   └─> completadaEn: "2025-11-03T15:30:00"

5. Cliente puede dejar reseña
   └─> Durante 14 días desde completadaEn
   └─> POST /califica-cancha
```

---

## ⚠️ Breaking Changes

### 1. Validación de Reseñas

**Antes:** Clientes podían reseñar si `terminaEn` estaba en los últimos 14 días.

**Ahora:** Clientes solo pueden reseñar si `completadaEn` existe y está en los últimos 14 días.

**Acción requerida:** 
- Si tienes reservas antiguas, ejecuta: `POST /reservas/completar-automaticas` (requiere Admin)
- O marca manualmente cada reserva: `PATCH /reservas/:id/completar`

---

### 2. Endpoint de Reservas Pendientes

**GET /califica-cancha/pendientes** ahora filtra por `completadaEn` en lugar de `estado`.

**Impacto:** Si hay reservas antiguas sin `completadaEn`, no aparecerán en esta lista hasta que sean completadas.

---

## 📱 Recomendaciones para Frontend

### 1. UI de Reservas del Dueño

Agregar botón "Completar" para reservas confirmadas que ya pasaron:

```jsx
{reserva.estado === 'Confirmada' && 
 reserva.terminaEn < new Date() && 
 !reserva.completadaEn && (
  <button onClick={() => completarReserva(reserva.idReserva)}>
    ✅ Marcar como Completada
  </button>
)}
```

---

### 2. Badge de Estado para Cliente

```jsx
function getEstadoBadge(reserva) {
  if (reserva.estado === 'Cancelada') return '❌ Cancelada';
  if (reserva.estado === 'Pendiente') return '⏳ Pendiente';
  if (reserva.completadaEn) return '✅ Completada';
  if (reserva.terminaEn < new Date()) return '⏰ Finalizada';
  if (reserva.iniciaEn < new Date()) return '▶️ En curso';
  return '✓ Confirmada';
}
```

---

### 3. Notificación de Reseña Pendiente

```jsx
{reserva.completadaEn && !reserva.tieneResena && (
  <Alert>
    Puedes reseñar esta reserva durante {diasRestantes} días más
  </Alert>
)}
```

---

## 🧪 Testing

### 🚀 Flujo Rápido de Testing (RECOMENDADO)

Para probar el flujo completo de reservas y reseñas de forma rápida:

```bash
# 1. Crear una reserva
curl -X POST http://localhost:3000/reservas \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "idCliente": 1,
    "idCancha": 1,
    "iniciaEn": "2025-11-04T10:00:00",
    "terminaEn": "2025-11-04T11:00:00",
    "cantidadPersonas": 10,
    "requiereAprobacion": false,
    "montoBase": 100,
    "montoExtra": 0,
    "montoTotal": 100
  }'
# Respuesta: { "reserva": { "idReserva": 123, ... } }

# 2. 🧪 Simular uso completo (DEV ONLY)
curl -X POST http://localhost:3000/reservas/123/simular-uso

# 3. Verificar que puede reseñar
curl -X POST http://localhost:3000/califica-cancha/validar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"idReserva": 123}'

# 4. Dejar reseña
curl -X POST http://localhost:3000/califica-cancha \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "idReserva": 123,
    "puntaje": 5,
    "comentario": "¡Excelente cancha!"
  }'
```

---

### Caso 1: Completar Reserva (Producción)
```bash
curl -X PATCH http://localhost:3000/reservas/123/completar \
  -H "Authorization: Bearer {token}"
```

### Caso 2: Verificar si puede reseñar
```bash
curl -X POST http://localhost:3000/califica-cancha/validar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"idReserva": 123}'
```

### Caso 3: Completar automáticas (Admin)
```bash
curl -X POST http://localhost:3000/reservas/completar-automaticas \
  -H "Authorization: Bearer {admin-token}"
```

### Caso 4: 🧪 Simular uso (DEV)
```bash
curl -X POST http://localhost:3000/reservas/123/simular-uso
```

---

## 🔧 Migración de Datos (Opcional)

Si tienes reservas antiguas que deberían permitir reseñas:

```bash
# Llamar al endpoint de completar automáticas (como Admin)
POST /reservas/completar-automaticas
```

Esto marcará como completadas todas las reservas confirmadas que ya terminaron.

---

## 📞 Contacto

Para dudas o problemas con la integración, contactar al equipo de backend.

**Documentación completa:** Ver código en `src/reservas/` y `src/califica_cancha/`
