# MODELO RELACIONAL - SISTEMA DE ESPACIOS DEPORTIVOS

## ENTIDADES PRINCIPALES

### PERSONA
```
PERSONA(idPersona, nombres, paterno, materno, documentoTipo, documentoNumero, telefono, telefonoVerificado, fechaNacimiento, genero, urlFoto, creadoEn)
```

### USUARIO
```
USUARIO(idUsuario, idPersona, usuario, correo, correoVerificado, avatarPath, hashContrasena, estado, creadoEn, actualizadoEn, ultimoAccesoEn, eliminadoEn)
  FK: idPersona → PERSONA
```

### ROL
```
ROL(idRol, rol, actualizadoEn, eliminadoEn)
  Valores: ADMIN, CLIENTE, DUENIO, CONTROLADOR
```

### USUARIO_ROL
```
USUARIO_ROL(idUsuario, idRol, asignadoEn, revocadoEn, eliminadoEn)
  FK: idUsuario → USUARIO
  FK: idRol → ROL
```

---

## ENTIDADES DE ACTORES

### CLIENTE
```
CLIENTE(idCliente, apodo, nivel, observaciones)
  FK: idCliente → PERSONA
```

### DUENIO
```
DUENIO(idPersonaD, verificado, verificadoEn, imagenCI, imagenFacial, inquiryId, personaStatus, creadoEn, actualizadoEn, eliminadoEn)
  FK: idPersonaD → PERSONA
```

### CONTROLADOR
```
CONTROLADOR(idPersonaOpe, codigoEmpleado, activo, turno)
  FK: idPersonaOpe → PERSONA
```

---

## ENTIDADES DE INFRAESTRUCTURA

### SEDE
```
SEDE(idSede, idPersonaD, nombre, descripcion, country, countryCode, stateProvince, city, district, addressLine, postalCode, latitude, longitude, timezone, direccion, latitud, longitud, telefono, email, politicas, estado, ratingPromedio, totalResenas, creadoEn, actualizadoEn, eliminadoEn)
  FK: idPersonaD → DUENIO
```

### DISCIPLINA
```
DISCIPLINA(idDisciplina, nombre, categoria, descripcion, creadoEn, actualizadoEn, eliminadoEn)
```

### CANCHA
```
CANCHA(idCancha, idSede, nombre, superficie, cubierta, aforoMax, dimensiones, reglasUso, iluminacion, estado, precio, horaApertura, horaCierre, ratingPromedio, totalResenas, creadoEn, actualizadoEn, eliminadoEn)
  FK: idSede → SEDE
```

### PARTE (Relación Cancha-Disciplina)
```
PARTE(idDisciplina, idCancha, eliminadoEn)
  FK: idDisciplina → DISCIPLINA
  FK: idCancha → CANCHA
```

### FOTO
```
FOTO(idFoto, tipo, idSede, idCancha, urlFoto, creadoEn, eliminadoEn)
  FK: idSede → SEDE (nullable)
  FK: idCancha → CANCHA (nullable)
  Valores tipo: 'sede', 'cancha'
```

---

## ENTIDADES DE RESERVAS Y OPERACIONES

### RESERVA
```
RESERVA(idReserva, idCliente, idCancha, iniciaEn, terminaEn, cantidadPersonas, requiereAprobacion, montoBase, montoExtra, montoTotal, creadoEn, estado, completadaEn, actualizadoEn, eliminadoEn)
  FK: idCliente → CLIENTE
  FK: idCancha → CANCHA
```

### PARTICIPA
```
PARTICIPA(idReserva, idCliente, confirmado, checkInEn)
  FK: idReserva → RESERVA
  FK: idCliente → CLIENTE
```

### CANCELACION
```
CANCELACION(idCancelacion, idCliente, idReserva, canceladaEn, motivo, canal)
  FK: idCliente → CLIENTE
  FK: idReserva → RESERVA
```

### PASES_ACCESO
```
PASES_ACCESO(idPaseAcceso, idReserva, codigoQR, hashCode, validoDesde, validoHasta, estado, vecesUsado, usoMaximo, primerUsoEn, ultimoUsoEn, creadoEn, actualizadoEn, eliminadoEn)
  FK: idReserva → RESERVA
  Estados: 'pendiente', 'activo', 'usado', 'expirado', 'cancelado'
```

### TRANSACCION
```
TRANSACCION(idTransaccion, idReserva, pasarela, metodo, monto, estado, idExterno, comisionPasarela, comisionPlataforma, monedaLiquidada, codigoAutorizacion, creadoEn, capturadoEn, rembolsadoEn)
  FK: idReserva → RESERVA
```

---

## ENTIDADES DE CONTROL Y TRABAJO

### TRABAJA (Controlador-Sede)
```
TRABAJA(idPersonaOpe, idSede, activo, asignadoDesde, asignadoHasta)
  FK: idPersonaOpe → CONTROLADOR
  FK: idSede → SEDE
```

### CONTROLA
```
CONTROLA(idPersonaOpe, idReserva, idPaseAcceso, accion, resultado, fecha)
  FK: idPersonaOpe → CONTROLADOR
  FK: idReserva → RESERVA
  FK: idPaseAcceso → PASES_ACCESO
```

---

## ENTIDADES DE CALIFICACIONES Y RESEÑAS

### CALIFICA_CANCHA
```
CALIFICA_CANCHA(idCliente, idCancha, idReserva, puntaje, comentario, creadaEn, editadaEn, estado)
  FK: idCliente → CLIENTE
  FK: idCancha → CANCHA
  FK: idReserva → RESERVA
  Puntaje: 1-5 estrellas
```

### CALIFICA_SEDE
```
CALIFICA_SEDE(idCliente, idSede, idReserva, puntajeGeneral, atencion, instalaciones, ubicacion, estacionamiento, vestuarios, limpieza, seguridad, comentario, fechaCalificacion, editadaEn)
  FK: idCliente → CLIENTE
  FK: idSede → SEDE
  FK: idReserva → RESERVA
  Puntajes: 1-5 estrellas (puntajeGeneral obligatorio, aspectos específicos opcionales)
```

### DENUNCIA
```
DENUNCIA(idCliente, idCancha, idSede, categoria, gravedad, estado, titulo, descripcion, asignadoA, creadoEn, actualizadoEn)
  FK: idCliente → CLIENTE
  FK: idCancha → CANCHA
  FK: idSede → SEDE
```

### FAVORITO
```
FAVORITO(idSede, idCliente, creadoEn, notificacionesActivas, etiquetas, notas)
  FK: idSede → SEDE
  FK: idCliente → CLIENTE
  UNIQUE: (idCliente, idSede)
```

---

## RESUMEN DE RELACIONES

### Relaciones 1:1
- USUARIO ← PERSONA
- CLIENTE ← PERSONA
- DUENIO ← PERSONA
- CONTROLADOR ← PERSONA

### Relaciones 1:N
- SEDE → CANCHA
- CANCHA → RESERVA
- CLIENTE → RESERVA
- RESERVA → PASES_ACCESO
- RESERVA → TRANSACCION
- RESERVA → CANCELACION
- DUENIO → SEDE
- SEDE → FOTO
- CANCHA → FOTO

### Relaciones N:M (con tabla intermedia)
- USUARIO ↔ ROL (a través de USUARIO_ROL)
- CANCHA ↔ DISCIPLINA (a través de PARTE)
- RESERVA ↔ CLIENTE (a través de PARTICIPA)
- CONTROLADOR ↔ SEDE (a través de TRABAJA)
- CONTROLADOR ↔ RESERVA ↔ PASES_ACCESO (a través de CONTROLA)

### Relaciones de Calificación
- CLIENTE → CANCHA (a través de CALIFICA_CANCHA)
- CLIENTE → SEDE (a través de CALIFICA_SEDE)
- CLIENTE → SEDE (a través de FAVORITO)
- CLIENTE → CANCHA/SEDE (a través de DENUNCIA)

---

## NOTAS IMPORTANTES

1. **Soft Delete**: Las entidades tienen campo `eliminadoEn` para borrado lógico
2. **Timestamps**: Mayoría de entidades tienen `creadoEn` y `actualizadoEn`
3. **Enumeraciones**:
   - TipoDocumento: CC, CE, TI, PP
   - Genero: MASCULINO, FEMENINO, OTRO
   - TipoRol: ADMIN, CLIENTE, DUENIO, CONTROLADOR
   - EstadoUsuario: ACTIVO, INACTIVO, BLOQUEADO, PENDIENTE, DESACTIVADO, ELIMINADO
   - EstadoPaseAcceso: pendiente, activo, usado, expirado, cancelado
   - TipoFoto: sede, cancha

4. **Campos Únicos**:
   - USUARIO: usuario, correo
   - PERSONA: documentoNumero (opcional)
   - PASES_ACCESO: codigoQR, hashCode
   - FAVORITO: (idCliente, idSede)

5. **Índices importantes**:
   - FAVORITO: idx_cliente_favorito, idx_sede_favorito
   - USUARIO_ROL: claves primarias compuestas
   - PARTE: claves primarias compuestas
   - PARTICIPA: claves primarias compuestas
   - TRABAJA: claves primarias compuestas
