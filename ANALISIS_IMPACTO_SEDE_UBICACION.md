# 📊 Análisis de Impacto - Cambios en Sede Entity

**Fecha:** 7 de noviembre de 2025  
**Cambio:** Agregar campos de ubicación universal a la entidad Sede  
**Estado:** ✅ Entity y DTO actualizados | ⏳ Pendiente migración BD

---

## 🔧 Cambios Realizados

### 1. **Entity: `Sede`** ✅
**Archivo:** `src/sede/entities/sede.entity.ts`

**Campos Nuevos Agregados:**
- ✅ `country` - País (string)
- ✅ `countryCode` - Código ISO país (string, opcional)
- ✅ `stateProvince` - Departamento/Estado/Provincia (string)
- ✅ `city` - Ciudad (string)
- ✅ `district` - Zona/Distrito/Barrio (string, opcional)
- ✅ `addressLine` - Dirección completa (string)
- ✅ `postalCode` - Código postal (string, opcional)
- ✅ `latitude` - Latitud (decimal)
- ✅ `longitude` - Longitud (decimal)
- ✅ `timezone` - Zona horaria (string, opcional)

**Campos Legacy (Deprecados pero mantenidos):**
- `direccion` → Ahora opcional
- `latitud` → Ahora opcional  
- `longitud` → Ahora opcional

### 2. **DTO: `CreateSedeDto`** ✅
**Archivo:** `src/sede/dto/create-sede.dto.ts`

**Validaciones Agregadas:**
- Validación de longitud para campos de ubicación
- `@IsLatitude()` y `@IsLongitude()` para coordenadas
- Campos opcionales marcados correctamente
- Documentación Swagger con ejemplos

### 3. **DTO: `UpdateSedeDto`** ✅
**Archivo:** `src/sede/dto/update-sede.dto.ts`
- Automáticamente hereda los cambios (usa `PartialType`)

### 4. **Migración SQL** ✅
**Archivo:** `database/migrations/add_location_fields_to_sede.sql`
- Script de migración PostgreSQL listo
- Incluye índices para búsqueda rápida
- Migra datos legacy a nuevos campos

---

## 📍 Endpoints Afectados

### **Módulo: Sede** 🔴 IMPACTO DIRECTO

#### `POST /sede` - Crear Sede
**Estado:** ⚠️ REQUIERE ACTUALIZACIÓN DEL REQUEST
**Cambios:**
- ✅ Backend listo (DTO actualizado)
- ⚠️ Frontend debe enviar nuevos campos:
  ```json
  {
    "idPersonaD": 1,
    "nombre": "Complejo Deportivo",
    "descripcion": "...",
    "country": "Bolivia",
    "stateProvince": "La Paz",
    "city": "La Paz",
    "district": "San Miguel",
    "addressLine": "Av. Saavedra #2540",
    "latitude": -16.5124789,
    "longitude": -68.0897456,
    "telefono": "...",
    "email": "...",
    "politicas": "...",
    "estado": "activo",
    "NIT": "...",
    "LicenciaFuncionamiento": "..."
  }
  ```

#### `GET /sede` - Listar Sedes
**Estado:** ✅ COMPATIBLE (con mejoras)
**Cambios:**
- Respuesta incluirá nuevos campos de ubicación
- Frontend puede mostrar ubicación estructurada
- Ejemplo de respuesta:
  ```json
  {
    "idSede": 1,
    "nombre": "Complejo Los Andes",
    "country": "Bolivia",
    "stateProvince": "La Paz",
    "city": "La Paz",
    "district": "San Miguel",
    "addressLine": "Av. Saavedra #2540",
    "latitude": -16.5124789,
    "longitude": -68.0897456,
    ...
  }
  ```

#### `GET /sede/:id` - Obtener Sede
**Estado:** ✅ COMPATIBLE
**Cambios:** Similar a listar sedes

#### `PATCH /sede/:id` - Actualizar Sede
**Estado:** ⚠️ FRONTEND DEBE ACTUALIZAR
**Cambios:**
- Puede actualizar nuevos campos de ubicación
- Campos legacy siguen funcionando

#### `DELETE /sede/:id` - Eliminar Sede
**Estado:** ✅ NO AFECTADO

#### `PATCH /sede/restore/:id` - Restaurar Sede
**Estado:** ✅ NO AFECTADO

---

### **Módulo: Cancha** 🟡 IMPACTO INDIRECTO

#### `GET /cancha` - Listar Canchas
**Estado:** 🟡 MEJORA DISPONIBLE
**Impacto:**
- Si se usa `eager: true` en relación con Sede, incluirá nuevos campos
- Frontend puede mostrar ubicación de la sede de cada cancha

#### `POST /cancha` - Crear Cancha
**Estado:** ✅ NO AFECTADO DIRECTAMENTE
**Nota:** Requiere `idSede` que debe existir con datos de ubicación

---

### **Módulo: Analytics** 🟡 IMPACTO MENOR

#### `GET /analytics/dashboard`
**Parámetro:** `idSede` (opcional)
**Estado:** ✅ NO AFECTADO
**Oportunidad:** Puede agregarse filtro por `city` o `district`

#### `GET /analytics/reservas-por-periodo`
**Parámetro:** `idSede` (opcional)
**Estado:** ✅ NO AFECTADO

#### `GET /analytics/canchas-mas-reservadas`
**Parámetro:** `idSede` (opcional)
**Estado:** ✅ NO AFECTADO

---

### **Módulo: Denuncia** 🟢 IMPACTO NULO

#### `POST /denuncia`
**Campo:** `idSede`
**Estado:** ✅ NO AFECTADO

---

### **Módulo: Controlador** 🟢 IMPACTO NULO

#### `POST /controlador`
**Campo:** `idSede`
**Estado:** ✅ NO AFECTADO

---

## 🎯 Nuevas Funcionalidades Habilitadas

Con estos cambios, ahora puedes implementar:

### 1. **Búsqueda por Ubicación** 🔍
```
GET /search?city=La Paz&district=San Miguel
GET /search?stateProvince=La Paz
GET /search?country=Bolivia
```

### 2. **Filtros Geográficos** 📍
```
GET /sede/by-location?city=La Paz
GET /sede/nearby?lat=-16.512&lng=-68.089&radius=5
```

### 3. **Autocompletado de Ubicaciones** 🎯
```
GET /sede/available-cities
GET /sede/available-districts?city=La Paz
```

---

## ⚠️ Acciones Requeridas

### 1. **Base de Datos** 🔴 URGENTE
- [ ] Ejecutar migración SQL: `database/migrations/add_location_fields_to_sede.sql`
- [ ] Verificar índices creados
- [ ] Actualizar registros existentes con datos de ubicación

### 2. **Backend** 🟡 RECOMENDADO
- [ ] Agregar validación de ubicaciones válidas (lista de ciudades/zonas)
- [ ] Crear servicio de búsqueda por ubicación
- [ ] Implementar endpoints de filtrado geográfico

### 3. **Frontend** 🟠 IMPORTANTE
- [ ] Actualizar formulario de creación de Sede
- [ ] Actualizar formulario de edición de Sede
- [ ] Mostrar ubicación estructurada en listados
- [ ] Implementar autocompletado de ciudades/zonas

### 4. **Testing** 🟢 DESPUÉS DE MIGRACIÓN
- [ ] Probar creación de sede con nuevos campos
- [ ] Probar actualización de sede
- [ ] Verificar que campos legacy siguen funcionando
- [ ] Probar búsquedas por ubicación

---

## 📋 Script de Validación de Datos

Después de ejecutar la migración, valida con estas queries:

```sql
-- Verificar campos agregados
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sede' 
  AND column_name IN ('country', 'stateProvince', 'city', 'district', 'addressLine', 'latitude', 'longitude')
ORDER BY ordinal_position;

-- Ver datos migrados
SELECT "idSede", nombre, country, "stateProvince", city, district, "addressLine", latitude, longitude
FROM sede 
LIMIT 10;

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'sede'
  AND indexname LIKE 'idx_sede_%';

-- Contar sedes sin ubicación completa
SELECT 
  COUNT(*) as total_sedes,
  COUNT("stateProvince") as con_provincia,
  COUNT(city) as con_ciudad,
  COUNT("addressLine") as con_direccion
FROM sede;
```

---

## 🔮 Próximos Pasos

1. **Inmediato:**
   - Ejecutar migración SQL
   - Actualizar datos existentes de sedes

2. **Corto Plazo:**
   - Implementar módulo de búsqueda (`SearchModule`)
   - Crear endpoints de filtrado

3. **Mediano Plazo:**
   - Implementar búsqueda por proximidad (radio)
   - Sistema de autocompletado
   - Mapas interactivos

---

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Verifica logs de PostgreSQL
2. Revisa que la sintaxis SQL sea compatible con tu versión de PG
3. Haz backup antes de ejecutar la migración

---

**Última actualización:** 2025-11-07
