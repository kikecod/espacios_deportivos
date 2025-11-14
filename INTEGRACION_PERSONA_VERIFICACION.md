# Integración de Verificación de Identidad con Persona

## 📋 Resumen

Se ha integrado la API de Persona (withpersona.com) para verificación de identidad de dueños de sedes deportivas.

## 🔧 Cambios Realizados

### 1. Entidad Dueño (`duenio.entity.ts`)

Se agregaron los siguientes campos:

```typescript
@Column({ length: 100, nullable: true })
inquiryId: string; // ID de la verificación en Persona

@Column({ length: 50, nullable: true, default: 'pending' })
personaStatus: string; // Estado: pending, approved, failed, etc.
```

### 2. Módulo API Persona (`api-persona/`)

Se creó un módulo completo con:
- ✅ Servicio para comunicación con API de Persona
- ✅ Controlador con endpoints REST
- ✅ DTOs de validación
- ✅ Documentación completa

### 3. Servicio Dueño (`duenio.service.ts`)

Se agregaron 3 métodos nuevos:

#### `iniciarVerificacion(id: number)`
Inicia el proceso de verificación de identidad

#### `actualizarEstadoVerificacion(id: number)`
Actualiza el estado desde Persona y marca como verificado si está aprobado

#### `obtenerDocumentoVerificado(id: number)`
Obtiene información del documento verificado

## 🚀 Endpoints Disponibles

### Endpoints con Autenticación

```http
# 1. Iniciar verificación
POST /duenio/{id}/verificacion/iniciar
Auth: Bearer token (ADMIN o DUENIO)

# 2. Consultar estado de verificación
GET /duenio/{id}/verificacion/estado
Auth: Bearer token (ADMIN o DUENIO)

# 3. Obtener documento verificado
GET /duenio/{id}/verificacion/documento
Auth: Bearer token (ADMIN)
```

### Endpoints de Prueba (SIN autenticación)

```http
# 1. Prueba iniciar verificación
POST /duenio/{id}/verificacion/prueba

# 2. Prueba consultar estado
GET /duenio/{id}/verificacion/prueba/estado
```

## 📝 Ejemplos de Uso

### 1. Iniciar Verificación

```bash
# Con Postman o curl
POST http://localhost:3000/duenio/1/verificacion/prueba
```

**Respuesta:**
```json
{
  "inquiryId": "inq_abc123xyz",
  "status": "created",
  "sessionToken": "session_token_xyz",
  "verificationUrl": "https://withpersona.com/verify?inquiry-id=inq_abc123xyz&session-token=session_token_xyz"
}
```

### 2. Consultar Estado

```bash
GET http://localhost:3000/duenio/1/verificacion/prueba/estado
```

**Respuesta:**
```json
{
  "inquiryId": "inq_abc123xyz",
  "status": "approved",
  "aprobada": true,
  "verificado": true
}
```

### 3. Flujo Completo

```bash
# Paso 1: Iniciar verificación
POST /duenio/1/verificacion/prueba

# Paso 2: El dueño completa la verificación en la URL proporcionada
# https://withpersona.com/verify?inquiry-id=...&session-token=...

# Paso 3: Consultar estado para actualizar en DB
GET /duenio/1/verificacion/prueba/estado

# Paso 4: Si está aprobada, el campo 'verificado' se actualiza a true
```

## 🔑 Variables de Entorno

Asegúrate de tener configuradas estas variables en `.env`:

```env
PERSONA_API_URL=https://withpersona.com

PERSONA_API_VERSION=2025-10-27
PERSONA_TEMPLATE_ID=itmpl_EgvfYZcqA4BeCRP6qsi9oMBVC1Yc
PERSONA_ENVIRONMENT=sandbox
```

## 📊 Estados de Verificación

| Estado | Descripción |
|--------|-------------|
| `created` | Verificación creada, esperando que el usuario inicie |
| `pending` | En proceso de revisión |
| `approved` | Verificación aprobada ✅ |
| `completed` | Proceso completado |
| `failed` | Verificación fallida ❌ |
| `expired` | Verificación expirada |

## 🧪 Testing en Sandbox

### Probar con un Dueño Existente

```bash
# 1. Verifica que exista un dueño
GET http://localhost:3000/duenio

# 2. Usa el ID del dueño para iniciar verificación
POST http://localhost:3000/duenio/{id}/verificacion/prueba

# 3. Copia la URL de verificación y ábrela en el navegador
# 4. Completa el proceso de verificación en el sandbox de Persona
# 5. Consulta el estado
GET http://localhost:3000/duenio/{id}/verificacion/prueba/estado
```

## ⚠️ Notas Importantes

1. **Sandbox vs Producción**
   - En sandbox, puedes usar documentos ficticios
   - Los resultados son simulados
   - No hay cobros

2. **Seguridad**
   - Las API Keys están en variables de entorno
   - Endpoints de prueba son solo para desarrollo
   - En producción, remover endpoints sin autenticación

3. **Flujo de Usuario**
   ```
   Usuario → Inicia verificación → Recibe URL → Completa verificación →
   Sistema consulta estado → Marca como verificado
   ```

4. **Webhooks (Opcional)**
   - Persona puede enviar webhooks cuando cambia el estado
   - Configurar en el dashboard de Persona
   - Implementar endpoint para recibir notificaciones automáticas

## 🔄 Próximos Pasos Sugeridos

1. ✅ **Implementar webhooks** para actualización automática de estados
2. ✅ **Agregar validaciones** antes de permitir crear sedes
3. ✅ **Dashboard** para administrar verificaciones pendientes
4. ✅ **Notificaciones** al dueño cuando sea aprobado/rechazado
5. ✅ **Logs** de auditoría de verificaciones

## 📚 Documentación Adicional

- [API Persona Documentation](https://docs.withpersona.com/)
- [Módulo API Persona](./src/api-persona/README.md)
- Dashboard Persona: https://app.withpersona.com

## 💡 Ejemplo de Integración en Frontend

```typescript
// 1. Iniciar verificación
const response = await fetch('/duenio/1/verificacion/iniciar', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const { verificationUrl } = await response.json();

// 2. Redirigir al usuario a la URL de verificación
window.location.href = verificationUrl;

// 3. Después que el usuario complete, consultar estado
const statusResponse = await fetch('/duenio/1/verificacion/estado', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const { aprobada } = await statusResponse.json();

if (aprobada) {
  console.log('¡Verificación aprobada! Ahora puede crear sedes.');
}
```
