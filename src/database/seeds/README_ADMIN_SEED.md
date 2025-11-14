# 🌱 Seed de Usuario Admin Root

## 📋 Descripción

Este seed crea automáticamente el usuario administrador principal (root) del sistema con todos los permisos necesarios.

## 🔧 Qué hace el seed

El seed crea **3 registros** en las siguientes tablas:

### 1. **Tabla: `personas`**
- Crea una persona con datos del administrador
- Campos:
  - `nombres`: Administrador
  - `paterno`: Root
  - `materno`: Sistema
  - `telefono`: +591-00000000
  - `telefonoVerificado`: true

### 2. **Tabla: `usuarios`**
- Crea el usuario admin vinculado a la persona
- Campos:
  - `usuario`: admin
  - `correo`: admin@rogu.com
  - `correoVerificado`: true
  - `hashContrasena`: (hasheada con bcrypt)
  - `estado`: ACTIVO
  - `idPersona`: ID de la persona creada

### 3. **Tabla: `usuarios_roles`**
- Asigna el rol ADMIN al usuario
- Campos:
  - `idUsuario`: ID del usuario admin
  - `idRol`: ID del rol ADMIN

## 🚀 Ejecución

El seed se ejecuta **automáticamente** cuando inicias el servidor NestJS:

```bash
npm run start:dev
```

### Orden de ejecución:
1. **Seed de Roles** (crea ADMIN, CLIENTE, DUENIO, CONTROLADOR)
2. **Seed de Disciplinas**
3. **Seed de Admin Root** ⬅️ Este seed

## 🔐 Credenciales del Admin Root

Después de ejecutar el seed, verás en la consola:

```
================================================
✅ USUARIO ADMIN ROOT CREADO EXITOSAMENTE
================================================
Usuario: admin
Email: admin@rogu.com
Contraseña: Admin123!
================================================
⚠️  IMPORTANTE: Cambia esta contraseña después del primer login
================================================
```

### Datos de Login:
- **Usuario**: `admin`
- **Correo**: `admin@rogu.com`
- **Contraseña**: `Admin123!`

## ⚠️ Importante

1. **El seed solo se ejecuta UNA VEZ**: Si ya existe un usuario con username `admin`, el seed no se ejecutará nuevamente.

2. **Cambiar contraseña por defecto**: La contraseña `Admin123!` es solo para el primer acceso. **Debes cambiarla inmediatamente** después del primer login.

3. **Dependencias**: Este seed requiere que el **seed de roles** se haya ejecutado primero (ya está configurado en el orden correcto).

## 🔄 Re-ejecutar el seed

Si necesitas recrear el usuario admin:

### Opción 1: Eliminar el usuario de la BD
```sql
-- Eliminar relación usuario-rol
DELETE FROM usuarios_roles WHERE "idUsuario" = (SELECT "idUsuario" FROM usuarios WHERE usuario = 'admin');

-- Eliminar usuario
DELETE FROM usuarios WHERE usuario = 'admin';

-- Eliminar persona (opcional)
DELETE FROM personas WHERE "idPersona" = (SELECT "idPersona" FROM usuarios WHERE usuario = 'admin');
```

### Opción 2: Modificar el seed
Edita el archivo `src/database/seeds/admin-root.seed.ts` y cambia el username:
```typescript
usuario: {
  usuario: 'superadmin', // Cambiar aquí
  correo: 'superadmin@rogu.com',
  // ...
}
```

## 📁 Archivos involucrados

```
src/database/
├── database.module.ts              # Registra las entidades
├── database-seeder.service.ts      # Servicio que ejecuta los seeds
└── seeds/
    └── admin-root.seed.ts          # Datos del admin root
```

## 🛠️ Troubleshooting

### Error: "No se encontró el rol ADMIN"
**Causa**: El seed de roles no se ejecutó correctamente.

**Solución**:
```bash
# Verificar que exista el rol ADMIN
SELECT * FROM roles WHERE rol = 'ADMIN';

# Si no existe, reiniciar el servidor
npm run start:dev
```

### Error: "duplicate key value violates unique constraint"
**Causa**: Ya existe un usuario con el mismo username o correo.

**Solución**: Ver sección "Re-ejecutar el seed" arriba.

## 🔍 Verificar que se creó correctamente

```sql
-- Verificar persona
SELECT * FROM personas WHERE nombres = 'Administrador';

-- Verificar usuario
SELECT * FROM usuarios WHERE usuario = 'admin';

-- Verificar rol asignado
SELECT 
  u.usuario, 
  u.correo, 
  r.rol 
FROM usuarios u
JOIN usuarios_roles ur ON u."idUsuario" = ur."idUsuario"
JOIN roles r ON ur."idRol" = r."idRol"
WHERE u.usuario = 'admin';
```

Deberías ver:
```
usuario | correo           | rol
--------|------------------|-------
admin   | admin@rogu.com   | ADMIN
```

## 🎯 Uso en el Frontend

Una vez creado el admin, puedes hacer login desde el frontend:

```typescript
// POST /api/auth/login
{
  "correo": "admin@rogu.com",
  "contrasena": "Admin123!"
}
```

Recibirás un token JWT que debes usar para acceder al panel de administración en `/admin/dashboard`.
