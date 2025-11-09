# 📦 Módulo de Sincronización Neo4j

Este módulo se encarga de sincronizar datos desde PostgreSQL hacia Neo4j para el sistema de recomendaciones.

## 📁 Estructura

```
sync/
├── seed/
│   └── neo4j-seed.service.ts      # Servicio de migración inicial
├── transformers/
│   ├── perfil-usuario.transformer.ts       # PostgreSQL → PerfilUsuario (Neo4j)
│   └── espacio-deportivo.transformer.ts    # PostgreSQL → EspacioDeportivo (Neo4j)
├── sync.controller.ts             # Endpoints para ejecutar seed
└── sync.module.ts                 # Módulo de sincronización
```

---

## 🚀 Migración Inicial (Seed)

### Paso 1: Asegúrate que Neo4j esté corriendo

Abre Neo4j Desktop y verifica que la base de datos `espacios_deportivos` esté iniciada.

### Paso 2: Ejecutar el Seed

**Usando Swagger:**
1. Navega a `http://localhost:3000/api`
2. Busca el endpoint `POST /sync/seed`
3. Click en "Try it out"
4. Click en "Execute"

**Usando cURL:**
```bash
curl -X POST http://localhost:3000/sync/seed
```

**Usando Postman:**
```
POST http://localhost:3000/sync/seed
```

### Paso 3: Verificar Resultados

El endpoint retornará algo como:

```json
{
  "success": true,
  "stats": {
    "usuariosMigrados": 25,
    "canchasMigradas": 40,
    "relacionesReservo": 150,
    "relacionesCalificacion": 75,
    "tiempoTotal": 3245
  },
  "errors": []
}
```

---

## 📊 Ver Estadísticas

Para verificar que los datos se migraron correctamente:

**Endpoint:**
```
GET /sync/stats
```

**Respuesta esperada:**
```json
{
  "totalNodes": 65,
  "totalRelationships": 225,
  "nodeLabels": ["PerfilUsuario", "EspacioDeportivo"]
}
```

---

## 🔍 Verificar en Neo4j Browser

Abre Neo4j Browser y ejecuta estas queries:

### Ver todos los nodos
```cypher
MATCH (n) RETURN n LIMIT 25
```

### Contar perfiles de usuario
```cypher
MATCH (p:PerfilUsuario) RETURN count(p) as totalUsuarios
```

### Contar espacios deportivos
```cypher
MATCH (e:EspacioDeportivo) RETURN count(e) as totalCanchas
```

### Ver relaciones de un usuario
```cypher
MATCH (u:PerfilUsuario {idUsuario: 1})-[r]->(c:EspacioDeportivo)
RETURN u, r, c
```

### Ver perfil completo de un usuario
```cypher
MATCH (u:PerfilUsuario {idUsuario: 1})
RETURN u
```

---

## ⚙️ Cómo Funciona la Migración

### 1. Limpieza de Neo4j
```cypher
MATCH (n) DETACH DELETE n
```

### 2. Migración de Canchas
- Lee todas las canchas activas (sin `eliminadoEn`)
- Extrae disciplinas de la relación `Parte`
- Crea nodos `EspacioDeportivo`

### 3. Migración de Usuarios
- Lee clientes con al menos 1 reserva completada
- Calcula:
  - Precio promedio de sus reservas
  - Valoración promedio que da
  - Disciplinas preferidas (de las canchas que reservó)
- Crea nodos `PerfilUsuario`

### 4. Migración de Relaciones RESERVO
- Lee todas las reservas completadas
- Crea relaciones con propiedades:
  - fecha
  - precioReserva
  - completada

### 5. Migración de Relaciones CALIFICO
- Lee todas las calificaciones activas
- Crea relaciones con propiedades:
  - rating (puntaje)
  - fecha
  - comentario

---

## 🔧 Transformers

### PerfilUsuarioTransformer

**Input:** 
- `idUsuario` (de tabla usuarios/clientes)
- Array de `Reserva` (completadas)
- Array de `CalificaCancha`

**Output:**
```typescript
{
  idUsuario: number,
  precioPromedio: number,        // Promedio de montoTotal de reservas
  valoracionPromedio: number,    // Promedio de puntajes dados
  disciplinasPreferidas: number[], // IDs únicos de disciplinas
  totalReservas: number,
  totalCalificaciones: number,
  ultimaActualizacion: Date
}
```

### EspacioDeportivoTransformer

**Input:**
- Entidad `Cancha` con relación `parte`

**Output:**
```typescript
{
  idCancha: number,
  nombre: string,
  precio: number,
  ratingPromedio: number,
  disciplinas: number[],  // De parte.idDisciplina
  superficie: string,
  activo: boolean,        // !eliminadoEn
  idSede: number,
  ultimaActualizacion: Date
}
```

---

## ⚠️ Notas Importantes

### Sobre `idUsuario`

⚠️ **IMPORTANTE:** Actualmente el seed usa `idCliente` como `idUsuario`. 

Si tu sistema tiene la relación:
```
Cliente → Persona → Usuario
```

Deberás ajustar el código en `neo4j-seed.service.ts` líneas 176 y 221 para obtener el verdadero `idUsuario`.

**Ejemplo de ajuste necesario:**
```typescript
// En vez de:
const idUsuario = cliente.idCliente;

// Debería ser algo como:
const idUsuario = await obtenerIdUsuarioPorCliente(cliente.idCliente);
```

### Re-ejecutar el Seed

El seed limpia completamente Neo4j antes de migrar. Puedes ejecutarlo múltiples veces sin problemas.

---

## 📝 Próximos Pasos

Después de ejecutar el seed exitosamente:

1. ✅ Verificar datos en Neo4j Browser
2. ✅ Crear índices (ver archivo `INDICES.md`)
3. ✅ Proceder a Fase 3 - Sincronización en Tiempo Real

---

## 🐛 Troubleshooting

### Error: "NEO4J_PASSWORD no está configurado"
- Verifica que `.env` tenga `NEO4J_PASSWORD` configurado

### Error: "Cannot connect to Neo4j"
- Verifica que Neo4j Desktop esté corriendo
- Verifica que el puerto 7687 esté disponible

### Error: "No se encontraron canchas/usuarios"
- Verifica que haya datos en PostgreSQL
- Verifica que las relaciones `parte` estén cargadas en las canchas

### Seed muy lento
- Es normal, puede tardar según la cantidad de datos
- Revisa los logs para ver el progreso

---

## 📚 Referencias

- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [TypeORM Documentation](https://typeorm.io/)
