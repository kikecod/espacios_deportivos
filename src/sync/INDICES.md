# 📊 Índices para Neo4j - Sistema de Recomendaciones

Ejecuta estas queries en **Neo4j Browser** después de completar el seed inicial.

---

## 🎯 Por qué necesitamos índices

Los índices mejoran significativamente el rendimiento de las consultas, especialmente cuando:
- Buscamos nodos por propiedades específicas (`idUsuario`, `idCancha`)
- Filtramos por condiciones (`activo = true`)
- Ordenamos resultados (`ORDER BY ratingPromedio`)

---

## 📝 Queries de Índices

### 1. Índice para PerfilUsuario por ID

```cypher
CREATE INDEX idx_perfil_usuario_id IF NOT EXISTS
FOR (p:PerfilUsuario) ON (p.idUsuario);
```

**Acelera queries como:**
```cypher
MATCH (p:PerfilUsuario {idUsuario: $idUsuario})
```

---

### 2. Índice para EspacioDeportivo por ID

```cypher
CREATE INDEX idx_espacio_id IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.idCancha);
```

**Acelera queries como:**
```cypher
MATCH (e:EspacioDeportivo {idCancha: $idCancha})
```

---

### 3. Índice para EspacioDeportivo activos

```cypher
CREATE INDEX idx_espacio_activo IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.activo);
```

**Acelera queries como:**
```cypher
MATCH (e:EspacioDeportivo)
WHERE e.activo = true
```

---

### 4. Índice para rating promedio de canchas

```cypher
CREATE INDEX idx_espacio_rating IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.ratingPromedio);
```

**Acelera queries con ORDER BY:**
```cypher
MATCH (e:EspacioDeportivo)
WHERE e.activo = true
RETURN e
ORDER BY e.ratingPromedio DESC
```

---

### 5. Índice para precio de canchas

```cypher
CREATE INDEX idx_espacio_precio IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.precio);
```

**Acelera filtros por rango de precio:**
```cypher
MATCH (e:EspacioDeportivo)
WHERE e.precio >= 50 AND e.precio <= 100
```

---

## 🔍 Verificar Índices Creados

Para ver todos los índices existentes:

```cypher
SHOW INDEXES
```

**Salida esperada:**
```
╒════════════════════════════════╤═══════════╤════════════╕
│ name                           │ state     │ type       │
╞════════════════════════════════╪═══════════╪════════════╡
│ idx_perfil_usuario_id          │ ONLINE    │ BTREE      │
│ idx_espacio_id                 │ ONLINE    │ BTREE      │
│ idx_espacio_activo             │ ONLINE    │ BTREE      │
│ idx_espacio_rating             │ ONLINE    │ BTREE      │
│ idx_espacio_precio             │ ONLINE    │ BTREE      │
╘════════════════════════════════╧═══════════╧════════════╛
```

---

## 🗑️ Eliminar Índices (si es necesario)

Si necesitas recrear un índice:

```cypher
DROP INDEX idx_perfil_usuario_id IF EXISTS;
DROP INDEX idx_espacio_id IF EXISTS;
DROP INDEX idx_espacio_activo IF EXISTS;
DROP INDEX idx_espacio_rating IF EXISTS;
DROP INDEX idx_espacio_precio IF EXISTS;
```

---

## 📊 Estadísticas de Índices

Para ver estadísticas de uso de un índice:

```cypher
CALL db.index.fulltext.queryNodes("idx_espacio_rating", "*") 
YIELD node, score
RETURN node, score
LIMIT 5;
```

---

## 🚀 Crear Todos los Índices de Una Vez

Puedes copiar y pegar este bloque completo en Neo4j Browser:

```cypher
// Crear todos los índices del sistema de recomendaciones
CREATE INDEX idx_perfil_usuario_id IF NOT EXISTS
FOR (p:PerfilUsuario) ON (p.idUsuario);

CREATE INDEX idx_espacio_id IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.idCancha);

CREATE INDEX idx_espacio_activo IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.activo);

CREATE INDEX idx_espacio_rating IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.ratingPromedio);

CREATE INDEX idx_espacio_precio IF NOT EXISTS
FOR (e:EspacioDeportivo) ON (e.precio);
```

---

## ⚡ Mejoras de Performance Esperadas

Con estos índices, deberías ver mejoras de:

- **10-100x más rápido** en búsquedas por ID
- **5-20x más rápido** en filtros por `activo`
- **3-10x más rápido** en ordenamientos por rating o precio

---

## 📝 Notas

- Los índices se crean **una sola vez** y persisten en la base de datos
- Neo4j los actualiza automáticamente cuando se modifican los datos
- El `IF NOT EXISTS` previene errores si el índice ya existe
- El estado `ONLINE` indica que el índice está listo para usarse

---

## ✅ Checklist de Verificación

- [ ] Ejecutar seed completo
- [ ] Verificar que hay datos en Neo4j
- [ ] Crear todos los índices
- [ ] Ejecutar `SHOW INDEXES` para verificar
- [ ] Todos los índices deben estar en estado `ONLINE`
- [ ] Proceder a Fase 3
