# 🌱 Database Seeding - Disciplinas

Este módulo se encarga de inicializar la base de datos con datos predeterminados de disciplinas deportivas.

## 📋 ¿Qué hace?

El sistema automáticamente crea 20 disciplinas deportivas la primera vez que se inicia la aplicación, **solo si la tabla está vacía**.

## 🎯 Disciplinas incluidas

### Deportes de equipo
- **Fútbol** - Deporte de equipo jugado entre dos conjuntos de once jugadores
- **Fútbol 5** - Variante del fútbol con equipos de 5 jugadores
- **Fútbol 7** - Variante del fútbol con equipos de 7 jugadores
- **Básquetbol** - Anotar puntos introduciendo el balón en la canasta
- **Vóleibol** - Dos equipos enfrentados sobre un terreno separados por una red

### Deportes de raqueta
- **Tenis** - Deporte de raqueta sobre una pista rectangular
- **Pádel** - Deporte de raqueta por parejas en pista cerrada
- **Tenis de Mesa** - Deporte de raqueta sobre una mesa

### Deportes acuáticos
- **Natación** - Desplazamiento en el agua sin tocar el suelo

### Deportes individuales
- **Atletismo** - Carreras, saltos y lanzamientos
- **Gimnasia** - Desarrollo de fuerza, flexibilidad y agilidad

### Deportes de combate
- **Boxeo** - Combate utilizando únicamente los puños
- **Karate** - Arte marcial tradicional japonés
- **Taekwondo** - Arte marcial coreano con técnicas de patada

### Deportes de velocidad
- **Ciclismo** - Recorrer distancias sobre una bicicleta

### Actividades de bienestar
- **Yoga** - Práctica física, mental y espiritual
- **Pilates** - Entrenamiento físico enfocado en equilibrio y flexibilidad

### Entrenamiento funcional
- **CrossFit** - Programa de fuerza y acondicionamiento funcional

### Actividades de baile
- **Zumba** - Fitness con ritmos latinos y ejercicio aeróbico

### Deportes extremos
- **Escalada** - Ascender o recorrer paredes de roca, nieve o hielo

## ⚙️ ¿Cómo funciona?

1. **Al iniciar la aplicación**, el servicio `DatabaseSeederService` se ejecuta automáticamente gracias al hook `OnModuleInit`
2. **Verifica** si ya existen disciplinas en la base de datos
3. **Si la tabla está vacía**, inserta las 20 disciplinas predeterminadas
4. **Si ya existen datos**, no hace nada y muestra un mensaje en los logs

## 📝 Logs

Al iniciar la aplicación verás uno de estos mensajes:

### Primera ejecución (tabla vacía):
```
[DatabaseSeederService] Iniciando seed de disciplinas...
[DatabaseSeederService] ✅ Se crearon 20 disciplinas exitosamente
```

### Ejecuciones posteriores (tabla con datos):
```
[DatabaseSeederService] Ya existen 20 disciplinas en la base de datos. No se ejecutará el seed.
```

### Si hay un error:
```
[DatabaseSeederService] ❌ Error al ejecutar seed de disciplinas: [mensaje de error]
```

## 🔧 Archivos creados

```
src/
└── database/
    ├── database.module.ts           # Módulo principal
    ├── database-seeder.service.ts   # Servicio que ejecuta el seeding
    └── seeds/
        └── disciplina.seed.ts       # Datos de disciplinas
```

## 🚀 Uso

No necesitas hacer nada especial. El seeding se ejecuta automáticamente cuando:

1. Inicias la aplicación por primera vez
2. La tabla `disciplina` está vacía
3. Has eliminado todas las disciplinas y reinicias la app

## ✅ Verificar que funcionó

Puedes verificar las disciplinas creadas consultando el endpoint:

```bash
GET /api/disciplina
```

O directamente en la base de datos:

```sql
SELECT * FROM disciplina;
```

## 🔄 Agregar más disciplinas al seed

Edita el archivo `src/database/seeds/disciplina.seed.ts` y agrega nuevas disciplinas:

```typescript
{
  nombre: 'Nueva Disciplina',
  categoria: 'Categoría',
  descripcion: 'Descripción de la disciplina'
}
```

**Nota:** Para que se ejecute el seed nuevamente, debes vaciar la tabla `disciplina` primero.

## 🛡️ Seguridad

- El seeding solo se ejecuta si la tabla está **completamente vacía**
- No sobrescribe datos existentes
- Es seguro ejecutar la aplicación múltiples veces
- No afecta otras tablas de la base de datos

## 🎓 Extender el sistema

Si necesitas agregar seeds para otras entidades (ej: roles, usuarios admin), sigue el mismo patrón:

1. Crea un archivo seed en `src/database/seeds/`
2. Agrega la lógica en `database-seeder.service.ts`
3. Importa el repositorio necesario en `database.module.ts`

---

**Creado por:** Sistema de Seeding Automático  
**Fecha:** Octubre 2025
