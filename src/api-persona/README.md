# API Persona - Verificación de Identidad

Este módulo integra la API de Persona (withpersona.com) para verificación de identidad de dueños de sedes deportivas.

## Configuración

Las siguientes variables de entorno deben estar configuradas en `.env`:

```env
PERSONA_API_URL=https://withpersona.com
PERSONA_API_KEY=persona_sandbox_xxxxxxxxxxxxxxxx
PERSONA_API_VERSION=2023-01-05
PERSONA_TEMPLATE_ID=itmpl_xxxxxxxxxxxxxxxx
PERSONA_ENVIRONMENT=sandbox
PERSONA_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

## Endpoints Disponibles

### 1. Crear Verificación
```http
POST /api-persona/verificaciones
Content-Type: application/json

{
  "referenceId": "12345678",
  "metadata": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

**Respuesta:**
```json
{
  "data": {
    "type": "inquiry",
    "id": "inq_xxxxxxxxxxxxxxxx",
    "attributes": {
      "status": "created",
      "reference-id": "12345678"
    }
  }
}
```

### 2. Obtener Estado de Verificación
```http
GET /api-persona/verificaciones/{inquiryId}
```

**Respuesta:**
```json
{
  "data": {
    "type": "inquiry",
    "id": "inq_xxxxxxxxxxxxxxxx",
    "attributes": {
      "status": "approved",
      "created-at": "2025-11-14T10:00:00Z"
    }
  }
}
```

### 3. Verificar si está Aprobada
```http
GET /api-persona/verificaciones/{inquiryId}/aprobada
```

**Respuesta:**
```json
{
  "inquiryId": "inq_xxxxxxxxxxxxxxxx",
  "aprobada": true
}
```

### 4. Generar URL de Sesión
```http
POST /api-persona/verificaciones/{inquiryId}/session
```

**Respuesta:**
```json
{
  "inquiryId": "inq_xxxxxxxxxxxxxxxx",
  "sessionToken": "session_xxxxxxxxxxxxxxxx",
  "url": "https://withpersona.com/verify?inquiry-id=inq_xxx&session-token=session_xxx"
}
```

### 5. Obtener Documento Verificado
```http
GET /api-persona/verificaciones/{inquiryId}/documento
```

## Uso en Otros Módulos

### Importar el Módulo

```typescript
import { Module } from '@nestjs/common';
import { ApiPersonaModule } from '../api-persona/api-persona.module';

@Module({
  imports: [ApiPersonaModule],
  // ...
})
export class DuenioModule {}
```

### Inyectar el Servicio

```typescript
import { Injectable } from '@nestjs/common';
import { ApiPersonaService } from '../api-persona/api-persona.service';

@Injectable()
export class DuenioService {
  constructor(
    private readonly personaService: ApiPersonaService,
  ) {}

  async verificarDuenio(ci: string) {
    // Crear verificación
    const inquiry = await this.personaService.crearVerificacion(ci, {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
    });

    // Generar URL para que el usuario complete la verificación
    const sessionToken = await this.personaService.generarSessionURL(inquiry.data.id);
    
    return {
      inquiryId: inquiry.data.id,
      sessionToken,
      verificationUrl: `https://withpersona.com/verify?inquiry-id=${inquiry.data.id}&session-token=${sessionToken}`,
    };
  }

  async verificarEstadoVerificacion(inquiryId: string) {
    const aprobada = await this.personaService.estaAprobada(inquiryId);
    
    if (aprobada) {
      // Actualizar estado del dueño en la base de datos
      // ...
    }
    
    return { aprobada };
  }
}
```

## Estados de Verificación

- **created**: Verificación creada, esperando que el usuario complete el proceso
- **pending**: En proceso de revisión
- **approved**: Verificación aprobada
- **completed**: Proceso completado
- **failed**: Verificación fallida
- **expired**: Verificación expirada

## Notas de Seguridad

1. Las API Keys nunca deben exponerse en el código
2. Usar siempre variables de entorno
3. En producción, cambiar a `PERSONA_ENVIRONMENT=production`
4. Implementar validación de webhooks usando `PERSONA_WEBHOOK_SECRET`
5. Validar siempre el estado de aprobación antes de otorgar permisos

## Testing en Sandbox

En modo sandbox puedes usar documentos de prueba:
- Cualquier CI funcionará para testing
- Los resultados de verificación pueden ser simulados
- No se cobran las verificaciones en sandbox

## Migración a Producción

1. Obtener API Key de producción desde el dashboard de Persona
2. Actualizar `PERSONA_API_KEY` con la clave de producción
3. Cambiar `PERSONA_ENVIRONMENT=production`
4. Configurar webhooks para recibir notificaciones automáticas
5. Implementar manejo de webhooks para actualizar estados automáticamente
