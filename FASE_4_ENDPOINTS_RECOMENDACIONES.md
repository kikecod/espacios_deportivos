# ✅ FASE 4 COMPLETADA: Endpoints de Recomendaciones

## 📋 Resumen

Se ha implementado exitosamente el **módulo de recomendaciones** con endpoints REST que utilizan el grafo de Neo4j para generar recomendaciones personalizadas basadas en **Content-Based Filtering** usando similitud del coseno y Jaccard.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP Requests
                        ▼
┌─────────────────────────────────────────────────────────┐
│              RecomendacionesController                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ GET /recomendaciones/espacios/:idUsuario         │  │
│  │ GET /recomendaciones/similares/:idCancha         │  │
│  │ GET /recomendaciones/populares                   │  │
│  │ GET /recomendaciones/explorar/:idUsuario         │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              RecomendacionesService                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • Algoritmo Content-Based Filtering              │  │
│  │ • Similitud del Coseno (α = 0.6)                │  │
│  │ • Similitud de Jaccard (β = 0.4)                │  │
│  │ • Generación de razones de recomendación        │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Neo4jService                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Neo4j Graph Database                        │
│  Nodos: PerfilUsuario, EspacioDeportivo                 │
│  Relaciones: RESERVO, CALIFICO                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Endpoints Implementados

### 1️⃣ **Recomendaciones Personalizadas**

**Endpoint:** `GET /recomendaciones/espacios/:idUsuario`

**Descripción:** Genera recomendaciones basadas en el historial de reservas del usuario.

**Query Parameters:**
- `limite` (opcional, default: 10) - Número máximo de recomendaciones

**Algoritmo:**
1. Obtiene el perfil del usuario (disciplinas preferidas, precio promedio)
2. Busca canchas que NO ha reservado
3. Calcula similitud con cada cancha candidata
4. Ordena por score descendente

**Request:**
```bash
GET http://localhost:3000/recomendaciones/espacios/1?limite=5
```

**Response:**
```json
{
  "total": 5,
  "recomendaciones": [
    {
      "idCancha": 15,
      "nombre": "Cancha de Fútbol Premium",
      "ubicacion": "Av. Principal 123",
      "precioPorHora": 65.00,
      "disciplinas": ["Fútbol", "Fútbol 7"],
      "ratingPromedio": 4.7,
      "cantidadResenas": 23,
      "activa": true,
      "score": 0.847,
      "razonRecomendacion": "✅ Fútbol • 💰 Precio similar a tus reservas • ⭐ 4.7 estrellas"
    },
    {
      "idCancha": 8,
      "nombre": "Cancha Multideporte Central",
      "ubicacion": "Calle 45 #67",
      "precioPorHora": 60.00,
      "disciplinas": ["Fútbol", "Básquet"],
      "ratingPromedio": 4.5,
      "cantidadResenas": 18,
      "activa": true,
      "score": 0.782,
      "razonRecomendacion": "✅ Fútbol • ⭐ 4.5 estrellas"
    }
  ],
  "metodo": "content-based",
  "mensaje": "Recomendaciones basadas en tus 12 reservas anteriores"
}
```

**Caso Especial:** Si el usuario NO tiene historial, automáticamente devuelve las canchas populares.

---

### 2️⃣ **Canchas Similares**

**Endpoint:** `GET /recomendaciones/similares/:idCancha`

**Descripción:** Encuentra canchas similares a una específica.

**Query Parameters:**
- `limite` (opcional, default: 10)

**Algoritmo:**
1. Obtiene la cancha de referencia
2. Compara con todas las demás canchas activas
3. Calcula similitud basada en precio, rating y disciplinas
4. Ordena por score

**Request:**
```bash
GET http://localhost:3000/recomendaciones/similares/5?limite=3
```

**Response:**
```json
{
  "total": 3,
  "recomendaciones": [
    {
      "idCancha": 12,
      "nombre": "Cancha de Fútbol Norte",
      "ubicacion": "Zona Norte",
      "precioPorHora": 58.00,
      "disciplinas": ["Fútbol", "Fútbol 7"],
      "ratingPromedio": 4.6,
      "cantidadResenas": 15,
      "activa": true,
      "score": 0.923,
      "razonRecomendacion": "Fútbol, Fútbol 7 • Precio similar ($58/h)"
    }
  ],
  "metodo": "similar",
  "mensaje": "Canchas similares a Cancha de Fútbol Central"
}
```

**Uso típico:** Mostrar al usuario en la página de detalle de una cancha: "Canchas similares que te pueden interesar"

---

### 3️⃣ **Canchas Populares**

**Endpoint:** `GET /recomendaciones/populares`

**Descripción:** Obtiene las canchas más populares y mejor valoradas.

**Query Parameters:**
- `limite` (opcional, default: 10)

**Algoritmo:**
1. Cuenta el número de reservas de cada cancha
2. Combina rating y popularidad (70% rating, 30% reservas)
3. Ordena por score descendente

**Request:**
```bash
GET http://localhost:3000/recomendaciones/populares?limite=5
```

**Response:**
```json
{
  "total": 5,
  "recomendaciones": [
    {
      "idCancha": 3,
      "nombre": "Cancha Premium Central",
      "ubicacion": "Centro",
      "precioPorHora": 75.00,
      "disciplinas": ["Fútbol", "Fútbol 7"],
      "ratingPromedio": 4.9,
      "cantidadResenas": 45,
      "activa": true,
      "score": 0.952,
      "razonRecomendacion": "⭐ 4.9 estrellas | 67 reservas"
    }
  ],
  "metodo": "popular",
  "mensaje": "Canchas más populares y mejor valoradas"
}
```

**Uso típico:** 
- Homepage del sitio
- Usuarios nuevos sin historial
- Sección "Trending" o "Destacados"

---

### 4️⃣ **Explorar Nuevas Opciones**

**Endpoint:** `GET /recomendaciones/explorar/:idUsuario`

**Descripción:** Muestra canchas que el usuario NO ha reservado, opcionalmente filtradas por disciplina.

**Query Parameters:**
- `disciplina` (opcional) - Filtrar por disciplina específica
- `limite` (opcional, default: 10)

**Algoritmo:**
1. Obtiene todas las canchas que el usuario NO ha reservado
2. Filtra por disciplina si se especifica
3. Ordena por rating y popularidad

**Request:**
```bash
# Explorar todas las opciones nuevas
GET http://localhost:3000/recomendaciones/explorar/1?limite=5

# Explorar solo canchas de Básquet
GET http://localhost:3000/recomendaciones/explorar/1?disciplina=Básquet&limite=5
```

**Response:**
```json
{
  "total": 5,
  "recomendaciones": [
    {
      "idCancha": 18,
      "nombre": "Cancha de Básquet Elite",
      "ubicacion": "Av. Deportiva 456",
      "precioPorHora": 55.00,
      "disciplinas": ["Básquet"],
      "ratingPromedio": 4.6,
      "cantidadResenas": 12,
      "activa": true,
      "score": 0.815,
      "razonRecomendacion": "🆕 Nueva opción - ⭐ 4.6"
    }
  ],
  "metodo": "popular",
  "mensaje": "Nuevas opciones de Básquet"
}
```

**Uso típico:**
- Sección "Descubre nuevos lugares"
- Filtros por deporte

---

## 🧮 Algoritmo de Similitud

### **Fórmula Combinada:**

```
Score = α × Similitud_Coseno + β × Similitud_Jaccard

Donde:
  α = 0.6 (peso para atributos numéricos)
  β = 0.4 (peso para atributos categóricos)
```

### **Similitud del Coseno (Atributos Numéricos):**

Calcula similitud entre vectores de números:
- **Precio por hora** de la cancha
- **Rating promedio**

**Fórmula:**
```
SimCoseno(A, B) = (A · B) / (||A|| × ||B||)
```

**Ejemplo:**
```typescript
// Perfil usuario: precio promedio = 60
// Cancha candidata: precio = 65, rating = 4.5

Vector usuario: [60]
Vector cancha: [65, 4.5]

// Se normaliza y calcula
SimCoseno ≈ 0.85
```

---

### **Similitud de Jaccard (Atributos Categóricos):**

Calcula similitud entre conjuntos (disciplinas):

**Fórmula:**
```
SimJaccard(A, B) = |A ∩ B| / |A ∪ B|
```

**Ejemplo:**
```typescript
// Usuario ha reservado canchas de: ["Fútbol", "Básquet"]
// Cancha candidata ofrece: ["Fútbol", "Vóley"]

Intersección: ["Fútbol"] → 1 elemento
Unión: ["Fútbol", "Básquet", "Vóley"] → 3 elementos

SimJaccard = 1/3 ≈ 0.333
```

---

### **Score Final:**

```typescript
score = 0.6 × 0.85 + 0.4 × 0.333
score = 0.51 + 0.133
score = 0.643
```

---

## 📊 Razones de Recomendación

El sistema genera automáticamente **razones explicativas** para cada recomendación:

### **Tipos de Razones:**

1. **Coincidencia de Disciplinas:**
   - `✅ Fútbol, Básquet`
   - Se muestra cuando hay disciplinas en común

2. **Precio Similar:**
   - `💰 Precio similar a tus reservas`
   - Se muestra cuando la diferencia es < $10

3. **Rating Alto:**
   - `⭐ 4.7 estrellas`
   - Se muestra para canchas con rating ≥ 4.0

4. **Popularidad:**
   - `67 reservas`
   - Se muestra el conteo de reservas totales

5. **Novedad:**
   - `🆕 Nueva opción`
   - Se muestra en exploración de nuevas canchas

**Ejemplo completo:**
```
"✅ Fútbol • 💰 Precio similar a tus reservas • ⭐ 4.7 estrellas"
```

---

## 🧪 Cómo Probar

### **1. Asegúrate de tener datos en Neo4j:**

```bash
# Ejecutar migración inicial si no lo has hecho
POST http://localhost:3000/sync/seed
```

### **2. Crear actividad de prueba:**

```bash
# Completar algunas reservas
PATCH http://localhost:3000/reservas/1/completar
PATCH http://localhost:3000/reservas/2/completar
PATCH http://localhost:3000/reservas/3/completar

# Crear calificaciones
POST http://localhost:3000/califica_cancha
{
  "idCliente": 1,
  "idReserva": 1,
  "puntaje": 5,
  "comentario": "Excelente!"
}
```

### **3. Probar endpoints de recomendaciones:**

```bash
# Recomendaciones personalizadas
GET http://localhost:3000/recomendaciones/espacios/1

# Canchas similares
GET http://localhost:3000/recomendaciones/similares/5

# Populares
GET http://localhost:3000/recomendaciones/populares

# Explorar nuevas
GET http://localhost:3000/recomendaciones/explorar/1?disciplina=Fútbol
```

### **4. Verificar logs del servidor:**

Deberías ver logs como:
```
[RecomendacionesService] 🎯 Generando recomendaciones personalizadas para usuario 1
[RecomendacionesService] 🔍 Buscando canchas similares a 5
[RecomendacionesService] 📊 Obteniendo canchas populares
```

---

## 📂 Archivos Creados

### **DTOs:**
- `src/recomendaciones/dto/espacio-recomendado.dto.ts`
  - `EspacioRecomendadoDto` - Estructura de una recomendación
  - `RecomendacionesResponseDto` - Estructura de respuesta del endpoint

### **Service:**
- `src/recomendaciones/recomendaciones.service.ts`
  - Métodos principales:
    - `obtenerRecomendacionesPersonalizadas()`
    - `obtenerCanchasSimilares()`
    - `obtenerCanchasPopulares()`
    - `explorarNuevasOpciones()`
  - Métodos auxiliares:
    - `calcularSimilitud()` - Algoritmo principal
    - `similitudCoseno()` - Similitud de vectores numéricos
    - `similitudJaccard()` - Similitud de conjuntos
    - `generarRazonRecomendacion()` - Generación de explicaciones

### **Controller:**
- `src/recomendaciones/recomendaciones.controller.ts`
  - 4 endpoints REST implementados
  - Validación de parámetros con Pipes

### **Module:**
- `src/recomendaciones/recomendaciones.module.ts`
  - Importa Neo4jModule
  - Exporta RecomendacionesService

---

## 🎨 Integración con Frontend

### **Ejemplo de uso en React/Angular:**

```typescript
// Obtener recomendaciones para el usuario actual
const obtenerRecomendaciones = async (userId: number) => {
  const response = await fetch(
    `http://localhost:3000/recomendaciones/espacios/${userId}?limite=6`
  );
  const data = await response.json();
  
  // Mostrar en UI
  data.recomendaciones.forEach(rec => {
    console.log(`${rec.nombre} - Score: ${rec.score}`);
    console.log(`Razón: ${rec.razonRecomendacion}`);
  });
};

// Mostrar canchas similares en página de detalle
const mostrarSimilares = async (canchaId: number) => {
  const response = await fetch(
    `http://localhost:3000/recomendaciones/similares/${canchaId}?limite=4`
  );
  const data = await response.json();
  
  // Renderizar sección "También te puede interesar"
  renderSimilares(data.recomendaciones);
};
```

---

## 🚀 Optimizaciones Futuras

### **1. Caché con Redis:**
```typescript
@Injectable()
export class RecomendacionesService {
  constructor(
    private neo4jService: Neo4jService,
    private cacheManager: Cache, // Redis
  ) {}

  async obtenerRecomendacionesPersonalizadas(idUsuario: number) {
    const cacheKey = `recomendaciones:${idUsuario}`;
    
    // Intentar obtener de caché
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    
    // Calcular y guardar en caché (TTL: 1 hora)
    const result = await this.calcularRecomendaciones(idUsuario);
    await this.cacheManager.set(cacheKey, result, { ttl: 3600 });
    
    return result;
  }
}
```

### **2. Pre-cálculo de Similitud:**

Crear relaciones `SIMILAR_A` entre canchas de antemano:

```cypher
// Job periódico (cada noche)
MATCH (c1:EspacioDeportivo), (c2:EspacioDeportivo)
WHERE c1.idCancha < c2.idCancha
WITH c1, c2, 
     // Calcular similitud
     gds.similarity.cosine([c1.precioPorHora, c1.ratingPromedio], 
                           [c2.precioPorHora, c2.ratingPromedio]) as simCoseno
MERGE (c1)-[r:SIMILAR_A]->(c2)
SET r.score = simCoseno
```

### **3. Filtros Avanzados:**

Agregar query parameters adicionales:
- `?precioMin=50&precioMax=80` - Filtro de precio
- `?ratingMin=4.0` - Rating mínimo
- `?ubicacion=Centro` - Filtro geográfico

### **4. A/B Testing:**

Probar diferentes pesos (α y β) y medir conversión:
```typescript
const EXPERIMENTS = {
  control: { alpha: 0.6, beta: 0.4 },
  variant_a: { alpha: 0.7, beta: 0.3 },
  variant_b: { alpha: 0.5, beta: 0.5 },
};
```

---

## ✅ Estado Final

| Componente | Estado | Archivo |
|------------|--------|---------|
| DTOs | ✅ Completo | `espacio-recomendado.dto.ts` |
| RecomendacionesService | ✅ Completo | `recomendaciones.service.ts` |
| RecomendacionesController | ✅ Completo | `recomendaciones.controller.ts` |
| RecomendacionesModule | ✅ Completo | `recomendaciones.module.ts` |
| Registro en AppModule | ✅ Completo | `app.module.ts` |
| Algoritmo Similitud | ✅ Completo | Coseno + Jaccard |
| Generación de Razones | ✅ Completo | Explicaciones automáticas |
| 4 Endpoints REST | ✅ Completo | `/espacios`, `/similares`, `/populares`, `/explorar` |

---

**🎉 FASE 4 COMPLETADA CON ÉXITO 🎉**

El sistema ahora ofrece **recomendaciones personalizadas inteligentes** basadas en el historial de cada usuario, utilizando técnicas de Content-Based Filtering con Neo4j.
