# 📚 Documentación de Endpoints - Módulo Reservas

## ✅ Endpoints Implementados

### **1. POST `/reservas` - Crear Nueva Reserva**

**Autenticación:** `ADMIN`, `DUENIO`, `CLIENTE`

**Request Body:**
```json
{
  "idCliente": 5,
  "idCancha": 4,
  "iniciaEn": "2025-10-20T09:00:00.000Z",
  "terminaEn": "2025-10-20T12:00:00.000Z",
  "cantidadPersonas": 10,
  "requiereAprobacion": false,
  "montoBase": 45,
  "montoExtra": 0,
  "montoTotal": 135
}
```

**Response (201):**
```json
{
  "message": "Reserva creada exitosamente",
  "reserva": {
    "idReserva": 123,
    "idCliente": 5,
    "idCancha": 4,
    "iniciaEn": "2025-10-20T09:00:00.000Z",
    "terminaEn": "2025-10-20T12:00:00.000Z",
    "cantidadPersonas": 10,
    "requiereAprobacion": false,
    "montoBase": "45.00",
    "montoExtra": "0.00",
    "montoTotal": "135.00",
    "creadoEn": "2025-10-16T15:30:45.123Z",
    "actualizadoEn": "2025-10-16T15:30:45.123Z"
  }
}
```

---

### **2. GET `/reservas/usuario/:idCliente` - Listar Reservas del Usuario**

**Autenticación:** `ADMIN`, `CLIENTE`

**Parámetros:**
- `idCliente` (path): ID del cliente

**Response (200):**
```json
{
  "reservas": [
    {
      "idReserva": 123,
      "idCliente": 5,
      "idCancha": 4,
      "iniciaEn": "2025-10-20T09:00:00.000Z",
      "terminaEn": "2025-10-20T12:00:00.000Z",
      "cantidadPersonas": 10,
      "requiereAprobacion": false,
      "montoBase": "45.00",
      "montoExtra": "0.00",
      "montoTotal": "135.00",
      "estado": "Confirmada",
      "metodoPago": "Tarjeta",
      "codigoQR": "ROGU-00000123",
      "creadoEn": "2025-10-15T10:30:00.000Z",
      "actualizadoEn": "2025-10-15T10:30:00.000Z",
      "cancha": {
        "idCancha": 4,
        "nombre": "Cancha de Fútbol Premium Elite",
        "superficie": "Césped sintético",
        "cubierta": false,
        "precio": "45.00",
        "fotos": [
          {
            "idFoto": 1,
            "urlFoto": "/uploads/canchas/futbol-1.jpg"
          }
        ],
        "sede": {
          "idSede": 1,
          "nombre": "Centro Deportivo Elite",
          "direccion": "Av. Revolución 1234",
          "ciudad": "N/A",
          "telefono": "+52 55 1234 5678",
          "email": "info@deportivoelite.com"
        }
      }
    }
  ],
  "total": 4,
  "activas": 2,
  "completadas": 1,
  "canceladas": 1
}
```

---

### **3. GET `/reservas/:id` - Detalle de una Reserva**

**Autenticación:** `ADMIN`, `CLIENTE`, `DUENIO`

**Parámetros:**
- `id` (path): ID de la reserva

**Response (200):**
```json
{
  "reserva": {
    "idReserva": 123,
    "idCliente": 5,
    "idCancha": 4,
    "iniciaEn": "2025-10-20T09:00:00.000Z",
    "terminaEn": "2025-10-20T12:00:00.000Z",
    "cantidadPersonas": 10,
    "requiereAprobacion": false,
    "montoBase": "45.00",
    "montoExtra": "0.00",
    "montoTotal": "135.00",
    "estado": "Confirmada",
    "metodoPago": "Tarjeta",
    "codigoQR": "ROGU-00000123",
    "creadoEn": "2025-10-15T10:30:00.000Z",
    "actualizadoEn": "2025-10-15T10:30:00.000Z",
    "cliente": {
      "idCliente": 5,
      "persona": {
        "nombres": "Juan",
        "paterno": "Pérez",
        "materno": "García",
        "telefono": "+52 55 9876 5432"
      }
    },
    "cancha": {
      "idCancha": 4,
      "nombre": "Cancha de Fútbol Premium Elite",
      "superficie": "Césped sintético",
      "cubierta": false,
      "aforoMax": 22,
      "dimensiones": "90m x 60m",
      "precio": "45.00",
      "iluminacion": "LED profesional",
      "fotos": [
        {
          "idFoto": 1,
          "urlFoto": "/uploads/canchas/futbol-1.jpg"
        }
      ],
      "sede": {
        "idSede": 1,
        "nombre": "Centro Deportivo Elite",
        "direccion": "Av. Revolución 1234",
        "ciudad": "N/A",
        "telefono": "+52 55 1234 5678",
        "email": "info@deportivoelite.com",
        "horarioApertura": "08:00:00",
        "horarioCierre": "22:00:00"
      }
    },
    "historial": [
      {
        "accion": "Creada",
        "fecha": "2025-10-15T10:30:00.000Z",
        "usuario": "Juan Pérez"
      }
    ]
  }
}
```

---

### **4. PATCH `/reservas/:id` - Modificar Reserva**

**Autenticación:** `ADMIN`, `CLIENTE`

**Parámetros:**
- `id` (path): ID de la reserva

**Request Body:**
```json
{
  "iniciaEn": "2025-10-20T10:00:00.000Z",
  "terminaEn": "2025-10-20T13:00:00.000Z",
  "cantidadPersonas": 12
}
```

**Response (200):**
```json
{
  "message": "Reserva actualizada exitosamente",
  "reserva": {
    "idReserva": 123,
    "idCliente": 5,
    "idCancha": 4,
    "iniciaEn": "2025-10-20T10:00:00.000Z",
    "terminaEn": "2025-10-20T13:00:00.000Z",
    "cantidadPersonas": 12,
    "montoBase": "45.00",
    "montoExtra": "0.00",
    "montoTotal": "135.00",
    "estado": "Confirmada",
    "actualizadoEn": "2025-10-16T14:30:00.000Z"
  }
}
```

**Errores:**
- `409` - El nuevo horario ya está reservado
- `409` - No se puede modificar una reserva cancelada
- `409` - No se puede modificar una reserva completada
- `409` - No se puede reservar en una fecha pasada

---

### **5. PATCH `/reservas/:id/cancelar` - Cancelar Reserva**

**Autenticación:** `ADMIN`, `CLIENTE`

**Parámetros:**
- `id` (path): ID de la reserva

**Request Body (opcional):**
```json
{
  "motivo": "Cambio de planes"
}
```

**Response (200):**
```json
{
  "message": "Reserva cancelada exitosamente",
  "reserva": {
    "idReserva": 123,
    "idCliente": 5,
    "idCancha": 4,
    "estado": "Cancelada",
    "canceladoEn": "2025-10-16T14:35:00.000Z",
    "motivoCancelacion": "Cambio de planes"
  },
  "reembolso": {
    "aplicable": true,
    "porcentaje": 100,
    "monto": "135.00",
    "mensaje": "Se reembolsará el 100% porque cancelaste con más de 24 horas de anticipación"
  }
}
```

**Política de Reembolsos:**
- ✅ **> 24 horas**: 100% de reembolso
- ⚠️ **2-24 horas**: 50% de reembolso
- ❌ **< 2 horas**: Sin reembolso (no permite cancelar)

**Errores:**
- `409` - Esta reserva ya está cancelada
- `409` - No se puede cancelar una reserva ya completada
- `409` - No se puede cancelar con menos de 2 horas de anticipación

---

### **6. GET `/reservas/cancha/:canchaId` - Reservas por Cancha**

**Autenticación:** `ADMIN`, `DUENIO`

**Parámetros:**
- `canchaId` (path): ID de la cancha

**Response (200):**
```json
[
  {
    "idReserva": 123,
    "fecha": "2025-10-20",
    "horaInicio": "09:00",
    "horaFin": "12:00",
    "estado": "Confirmada"
  },
  {
    "idReserva": 124,
    "fecha": "2025-10-20",
    "horaInicio": "14:00",
    "horaFin": "16:00",
    "estado": "Confirmada"
  }
]
```

---

### **7. GET `/reservas/duenio/:duenioId` - Reservas por Dueño**

**Autenticación:** `ADMIN`, `DUENIO`

**Parámetros:**
- `duenioId` (path): ID del dueño

**Response (200):**
```json
[
  {
    "idReserva": 123,
    "idCliente": 5,
    "idCancha": 4,
    "iniciaEn": "2025-10-20T09:00:00.000Z",
    "terminaEn": "2025-10-20T12:00:00.000Z",
    "cantidadPersonas": 10,
    "montoTotal": 135,
    "estado": "Confirmada",
    "cliente": {
      "idCliente": 5,
      "persona": {
        "nombres": "Juan",
        "paterno": "Pérez"
      }
    }
  }
]
```

---

### **8. DELETE `/reservas/:id` - Eliminar Reserva (Soft Delete)**

**Autenticación:** `ADMIN`

**Parámetros:**
- `id` (path): ID de la reserva

**Response (200):**
```json
{
  "affected": 1
}
```

---

## 🔐 Roles y Permisos

| Endpoint | ADMIN | DUENIO | CLIENTE |
|----------|-------|--------|---------|
| POST `/reservas` | ✅ | ✅ | ✅ |
| GET `/reservas` | ✅ | ❌ | ❌ |
| GET `/reservas/usuario/:id` | ✅ | ❌ | ✅ |
| GET `/reservas/:id` | ✅ | ✅ | ✅ |
| GET `/reservas/cancha/:id` | ✅ | ✅ | ❌ |
| GET `/reservas/duenio/:id` | ✅ | ✅ | ❌ |
| PATCH `/reservas/:id` | ✅ | ❌ | ✅ |
| PATCH `/reservas/:id/cancelar` | ✅ | ❌ | ✅ |
| DELETE `/reservas/:id` | ✅ | ❌ | ❌ |

---

## 📊 Mapeo Frontend ↔ Backend

### Estados de Reserva
| Backend | Frontend |
|---------|----------|
| `"Confirmada"` | `'active'` |
| `"Pendiente"` | `'active'` |
| `"Completada"` | `'completed'` |
| `"Cancelada"` | `'cancelled'` |

### Código QR
```typescript
// Backend genera:
idReserva: 123 → codigoQR: "ROGU-00000123"
```

### Formato de Horarios
```typescript
// Backend devuelve:
"iniciaEn": "2025-10-20T09:00:00.000Z"
"terminaEn": "2025-10-20T12:00:00.000Z"

// Frontend convierte a:
"date": "20 de octubre de 2025"
"timeSlot": "09:00 - 12:00"
```

---

## 🧪 Testing con cURL

### Crear Reserva
```bash
curl -X POST http://localhost:3000/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "idCliente": 5,
    "idCancha": 4,
    "iniciaEn": "2025-10-20T09:00:00.000Z",
    "terminaEn": "2025-10-20T12:00:00.000Z",
    "cantidadPersonas": 10,
    "requiereAprobacion": false,
    "montoBase": 45,
    "montoExtra": 0,
    "montoTotal": 135
  }'
```

### Listar Mis Reservas
```bash
curl -X GET http://localhost:3000/reservas/usuario/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Modificar Reserva
```bash
curl -X PATCH http://localhost:3000/reservas/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cantidadPersonas": 12
  }'
```

### Cancelar Reserva
```bash
curl -X PATCH http://localhost:3000/reservas/123/cancelar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "motivo": "Cambio de planes"
  }'
```

---

## ✅ Checklist Completo

- [x] POST `/reservas` - Crear reserva
- [x] GET `/reservas/usuario/:id` - Listar reservas del usuario
- [x] GET `/reservas/:id` - Detalle de reserva
- [x] PATCH `/reservas/:id` - Modificar reserva
- [x] PATCH `/reservas/:id/cancelar` - Cancelar reserva
- [x] GET `/reservas/cancha/:id` - Reservas por cancha
- [x] GET `/reservas/duenio/:id` - Reservas por dueño
- [x] DELETE `/reservas/:id` - Eliminar reserva
- [x] Validación de horarios disponibles
- [x] Cálculo automático de reembolsos
- [x] Generación de códigos QR
- [x] Transformación de datos para frontend
- [x] Autenticación y autorización
- [x] Manejo de errores completo

---

**Última actualización:** 16 de octubre de 2025  
**Estado:** ✅ TODOS LOS ENDPOINTS IMPLEMENTADOS  
**Versión Backend:** NestJS + TypeORM + PostgreSQL
