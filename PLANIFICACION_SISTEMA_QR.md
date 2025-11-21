# 📋 PLANIFICACIÓN: SISTEMA DE PASES DE ACCESO CON QR

**Fecha:** 6 de noviembre de 2025  
**Proyecto:** Backend Reservas - Espacios Deportivos  
**Módulo:** Pases de Acceso (QR)  
**Estado:** En Planificación  

---

## 🎯 OBJETIVO

Implementar un sistema completo de pases de acceso mediante códigos QR para gestionar el ingreso de clientes a las canchas deportivas, garantizando:
- ✅ Seguridad en el acceso
- ✅ Trazabilidad de entradas/salidas
- ✅ Validación automatizada
- ✅ Control de accesos por parte del personal (controladores)

---

## 📊 ANÁLISIS DEL ESTADO ACTUAL

### **Estructura Existente**

#### ✅ **Entidades Relacionadas:**
- **`PasesAcceso`**: Tabla base con hashCode, validez temporal y estado
- **`Reserva`**: Relación OneToMany con pases de acceso
- **`Controla`**: Tabla intermedia que registra validaciones (Controlador + Reserva + PaseAcceso)
- **`Transaccion`**: Gestiona pagos de reservas

#### ✅ **Flujo Actual:**
```
Cliente crea Reserva → Paga (Transacción) → Estado: "Confirmada" 
→ [FALTA: Generar Pase QR] → [FALTA: Validar QR] → Completar Reserva
```

#### ⚠️ **Limitaciones Identificadas:**
1. **CRUD básico sin lógica de negocio**
   - No hay generación automática de pases
   - No hay generación de imágenes QR
   - No hay validación de QR

2. **Gestión de estados incompleta**
   - Solo existe campo `estado` en PasesAcceso
   - No hay transiciones automáticas de estados
   - No hay invalidación al cancelar reserva

3. **Falta integración con Reservas**
   - Los pases no se crean automáticamente
   - No hay relación con el estado de pago

4. **Entidad PasesAcceso mejorable**
   - Falta columna `idReserva` (solo está la relación)
   - `idPaseAcceso` debería ser auto-generado
   - `creadoEn` debería ser automático

---

## 🏗️ ARQUITECTURA PROPUESTA

### **1. MODELO DE DATOS**

#### **Entidad: `PasesAcceso` (Mejorada)**
```typescript
@Entity()
export class PasesAcceso {
    @PrimaryGeneratedColumn()
    idPaseAcceso: number;  // Auto-generado

    @Column({ type: 'int', nullable: false })
    idReserva: number;  // FK explícita

    @ManyToOne(() => Reserva, (reserva) => reserva.pasesAcceso, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idReserva' })
    reserva: Reserva;

    @Column({ length: 500, nullable: false, unique: true })
    codigoQR: string;  // UUID v4 único

    @Column({ length: 200, nullable: false, unique: true })
    hashCode: string;  // SHA-256 del código QR

    @Column({ type: 'timestamp', nullable: false })
    validoDesde: Date;  // Ej: 30 min antes de la reserva

    @Column({ type: 'timestamp', nullable: false })
    validoHasta: Date;  // Ej: 30 min después de la reserva

    @Column({ length: 50, nullable: false, default: 'pendiente' })
    estado: string;  // Estados: pendiente, activo, usado, expirado, cancelado

    @Column({ type: 'int', nullable: false, default: 0 })
    vecesUsado: number;  // Contador de veces que se escaneó

    @Column({ type: 'int', nullable: false, default: 1 })
    usoMaximo: number;  // Máximo de usos permitidos (1 = entrada única)

    @Column({ type: 'timestamp', nullable: true })
    primerUsoEn: Date | null;  // Fecha del primer escaneo

    @Column({ type: 'timestamp', nullable: true })
    ultimoUsoEn: Date | null;  // Fecha del último escaneo

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizadoEn: Date;

    @OneToMany(() => Controla, (controla) => controla.paseAcceso)
    controlas: Controla[];
}
```

#### **Estados del Pase de Acceso**
```typescript
export enum EstadoPaseAcceso {
  PENDIENTE = 'pendiente',    // Creado, esperando activación
  ACTIVO = 'activo',          // Listo para ser usado
  USADO = 'usado',            // Ya fue utilizado (entrada registrada)
  EXPIRADO = 'expirado',      // Fuera de ventana de validez
  CANCELADO = 'cancelado'     // Reserva cancelada
}
```

---

### **2. LÓGICA DE NEGOCIO**

#### **A. Generación de Pases de Acceso**

**Trigger:** Cuando una reserva pasa a estado "Confirmada" (después del pago)

**Algoritmo:**
```typescript
async generarPaseParaReserva(reserva: Reserva): Promise<PasesAcceso> {
  // 1. Generar código QR único
  const codigoQR = uuid.v4();  // Ej: "550e8400-e29b-41d4-a716-446655440000"
  
  // 2. Generar hash seguro
  const hashCode = crypto
    .createHash('sha256')
    .update(`${codigoQR}-${reserva.idReserva}-${Date.now()}`)
    .digest('hex');
  
  // 3. Calcular ventana de validez
  const validoDesde = new Date(reserva.iniciaEn.getTime() - 30 * 60 * 1000); // 30 min antes
  const validoHasta = new Date(reserva.terminaEn.getTime() + 30 * 60 * 1000); // 30 min después
  
  // 4. Crear pase
  const pase = this.pasesAccesoRepository.create({
    idReserva: reserva.idReserva,
    codigoQR,
    hashCode,
    validoDesde,
    validoHasta,
    estado: EstadoPaseAcceso.PENDIENTE,
    vecesUsado: 0,
    usoMaximo: 1  // Por defecto: entrada única
  });
  
  // 5. Guardar y retornar
  return await this.pasesAccesoRepository.save(pase);
}
```

**Consideraciones:**
- ✅ Ejecutar en transacción con confirmación de reserva
- ✅ Validar que no exista pase previo para esa reserva
- ✅ Activar pase automáticamente 30 min antes del horario

---

#### **B. Generación de Imagen QR**

**Endpoint:** `GET /pases-acceso/:idPase/qr` o `GET /pases-acceso/reserva/:idReserva/qr`

**Librería:** `qrcode` (npm)

**Formato de Datos en el QR:**
```json
{
  "paseId": 123,
  "reservaId": 456,
  "codigo": "550e8400-e29b-41d4-a716-446655440000",
  "hash": "a8b3c4d5...",
  "valido": "2025-11-06T10:00:00Z"
}
```

**Implementación:**
```typescript
async generarImagenQR(idPase: number): Promise<Buffer> {
  // 1. Obtener pase
  const pase = await this.pasesAccesoRepository.findOne({
    where: { idPaseAcceso: idPase },
    relations: ['reserva']
  });
  
  if (!pase) throw new NotFoundException('Pase no encontrado');
  
  // 2. Preparar datos
  const datosQR = {
    paseId: pase.idPaseAcceso,
    reservaId: pase.idReserva,
    codigo: pase.codigoQR,
    hash: pase.hashCode,
    valido: pase.validoHasta.toISOString()
  };
  
  // 3. Generar QR
  const qrString = JSON.stringify(datosQR);
  const qrBuffer = await QRCode.toBuffer(qrString, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2
  });
  
  return qrBuffer;
}
```

**Opciones de retorno:**
- **PNG:** `res.type('image/png').send(buffer)`
- **Base64:** `{ qr: buffer.toString('base64') }`
- **Data URI:** `data:image/png;base64,${base64}`

---

#### **C. Validación de QR (Scanner)**

**Endpoint:** `POST /pases-acceso/validar`

**Request Body:**
```json
{
  "codigoQR": "550e8400-e29b-41d4-a716-446655440000",
  "idControlador": 5,  // ID del operador que escanea
  "accion": "entrada"  // "entrada" o "salida"
}
```

**Algoritmo de Validación:**
```typescript
async validarQR(dto: ValidarQRDto): Promise<ResultadoValidacion> {
  // 1. Buscar pase por código QR
  const pase = await this.pasesAccesoRepository.findOne({
    where: { codigoQR: dto.codigoQR },
    relations: ['reserva', 'reserva.cliente', 'reserva.cancha']
  });
  
  if (!pase) {
    return {
      valido: false,
      motivo: 'QR_NO_EXISTE',
      mensaje: 'Código QR inválido o no registrado'
    };
  }
  
  // 2. Validar estado del pase
  if (pase.estado === EstadoPaseAcceso.CANCELADO) {
    return {
      valido: false,
      motivo: 'PASE_CANCELADO',
      mensaje: 'La reserva fue cancelada'
    };
  }
  
  if (pase.estado === EstadoPaseAcceso.EXPIRADO) {
    return {
      valido: false,
      motivo: 'PASE_EXPIRADO',
      mensaje: 'El pase ha expirado'
    };
  }
  
  // 3. Validar ventana de tiempo
  const ahora = new Date();
  if (ahora < pase.validoDesde) {
    return {
      valido: false,
      motivo: 'DEMASIADO_TEMPRANO',
      mensaje: `El pase será válido desde ${pase.validoDesde.toLocaleString()}`,
      validoDesde: pase.validoDesde
    };
  }
  
  if (ahora > pase.validoHasta) {
    // Marcar como expirado
    await this.pasesAccesoRepository.update(pase.idPaseAcceso, {
      estado: EstadoPaseAcceso.EXPIRADO
    });
    
    return {
      valido: false,
      motivo: 'PASE_VENCIDO',
      mensaje: `El pase venció el ${pase.validoHasta.toLocaleString()}`
    };
  }
  
  // 4. Validar usos
  if (pase.vecesUsado >= pase.usoMaximo) {
    return {
      valido: false,
      motivo: 'YA_UTILIZADO',
      mensaje: 'Este pase ya fue utilizado',
      primerUso: pase.primerUsoEn
    };
  }
  
  // 5. Validar estado de la reserva
  if (pase.reserva.estado !== 'Confirmada') {
    return {
      valido: false,
      motivo: 'RESERVA_NO_CONFIRMADA',
      mensaje: `Reserva en estado: ${pase.reserva.estado}`
    };
  }
  
  // 6. TODO VALIDADO ✅ - Registrar acceso
  const ahora = new Date();
  await this.pasesAccesoRepository.update(pase.idPaseAcceso, {
    estado: EstadoPaseAcceso.USADO,
    vecesUsado: pase.vecesUsado + 1,
    primerUsoEn: pase.primerUsoEn || ahora,
    ultimoUsoEn: ahora
  });
  
  // 7. Registrar en tabla Controla
  await this.controlaRepository.save({
    idPersonaOpe: dto.idControlador,
    idReserva: pase.idReserva,
    idPaseAcceso: pase.idPaseAcceso,
    accion: dto.accion,
    resultado: 'exitoso',
    fecha: ahora
  });
  
  // 8. Retornar resultado exitoso
  return {
    valido: true,
    motivo: 'ACCESO_PERMITIDO',
    mensaje: '✅ Acceso concedido',
    pase: {
      id: pase.idPaseAcceso,
      vecesUsado: pase.vecesUsado + 1,
      ultimoUso: ahora
    },
    reserva: {
      id: pase.reserva.idReserva,
      cliente: pase.reserva.cliente.nombres,
      cancha: pase.reserva.cancha.nombre,
      horario: `${pase.reserva.iniciaEn} - ${pase.reserva.terminaEn}`
    }
  };
}
```

---

#### **D. Gestión de Estados (Automatizada)**

**Transiciones de Estados:**
```
PENDIENTE → ACTIVO (automático cuando llega validoDesde)
ACTIVO → USADO (cuando se escanea exitosamente)
ACTIVO → EXPIRADO (cuando pasa validoHasta)
* → CANCELADO (cuando se cancela la reserva)
```

**Implementación:**

1. **Job/Cron para activar pases:**
```typescript
@Cron('*/5 * * * *')  // Cada 5 minutos
async activarPasesPendientes() {
  const ahora = new Date();
  
  await this.pasesAccesoRepository
    .createQueryBuilder()
    .update(PasesAcceso)
    .set({ estado: EstadoPaseAcceso.ACTIVO })
    .where('estado = :estado', { estado: EstadoPaseAcceso.PENDIENTE })
    .andWhere('validoDesde <= :ahora', { ahora })
    .execute();
}
```

2. **Job/Cron para expirar pases:**
```typescript
@Cron('0 * * * *')  // Cada hora
async expirarPasesVencidos() {
  const ahora = new Date();
  
  await this.pasesAccesoRepository
    .createQueryBuilder()
    .update(PasesAcceso)
    .set({ estado: EstadoPaseAcceso.EXPIRADO })
    .where('estado IN (:...estados)', { 
      estados: [EstadoPaseAcceso.PENDIENTE, EstadoPaseAcceso.ACTIVO] 
    })
    .andWhere('validoHasta < :ahora', { ahora })
    .execute();
}
```

3. **Hook al cancelar reserva:**
```typescript
// En ReservasService.cancelarReserva()
async cancelarPasesDeReserva(idReserva: number) {
  await this.pasesAccesoRepository.update(
    { idReserva },
    { estado: EstadoPaseAcceso.CANCELADO }
  );
}
```

---

### **3. INTEGRACIÓN CON MÓDULO DE RESERVAS**

#### **A. Crear Pase al Confirmar Reserva**

**Modificación en `ReservasService`:**
```typescript
// Después de confirmar pago en transacciones
async confirmarReserva(idReserva: number) {
  // 1. Actualizar estado
  await this.reservaRepository.update(idReserva, {
    estado: 'Confirmada'
  });
  
  // 2. Generar pase de acceso automáticamente
  const reserva = await this.reservaRepository.findOne({
    where: { idReserva }
  });
  
  const pase = await this.pasesAccesoService.generarPaseParaReserva(reserva);
  
  return {
    reserva,
    paseAcceso: {
      id: pase.idPaseAcceso,
      codigo: pase.codigoQR,
      validoDesde: pase.validoDesde,
      validoHasta: pase.validoHasta
    }
  };
}
```

#### **B. Invalidar Pase al Cancelar Reserva**

```typescript
async cancelarReserva(idReserva: number) {
  // ... lógica existente ...
  
  // Invalidar todos los pases asociados
  await this.pasesAccesoService.cancelarPasesDeReserva(idReserva);
}
```

---

### **4. API ENDPOINTS**

#### **Controlador: `PasesAccesoController`**

```typescript
// 1. Obtener pase por reserva
@Get('reserva/:idReserva')
@Auth([TipoRol.CLIENTE, TipoRol.ADMIN, TipoRol.CONTROLADOR])
async obtenerPasePorReserva(@Param('idReserva') idReserva: number) {
  return this.pasesAccesoService.findByReserva(idReserva);
}

// 2. Generar imagen QR (PNG)
@Get(':id/qr')
@Auth([TipoRol.CLIENTE, TipoRol.ADMIN])
async generarQR(
  @Param('id') id: number,
  @Res() res: Response
) {
  const qrBuffer = await this.pasesAccesoService.generarImagenQR(id);
  res.type('image/png').send(qrBuffer);
}

// 3. Obtener QR en base64 (para apps móviles)
@Get(':id/qr-base64')
@Auth([TipoRol.CLIENTE, TipoRol.ADMIN])
async generarQRBase64(@Param('id') id: number) {
  const qrBuffer = await this.pasesAccesoService.generarImagenQR(id);
  return {
    qr: qrBuffer.toString('base64'),
    formato: 'base64',
    tipo: 'image/png'
  };
}

// 4. Validar QR (Scanner)
@Post('validar')
@Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
async validarQR(@Body() dto: ValidarQRDto) {
  return this.pasesAccesoService.validarQR(dto);
}

// 5. Historial de validaciones de un pase
@Get(':id/historial')
@Auth([TipoRol.ADMIN, TipoRol.CONTROLADOR])
async obtenerHistorial(@Param('id') id: number) {
  return this.pasesAccesoService.obtenerHistorialValidaciones(id);
}

// 6. Reactivar pase (casos especiales)
@Patch(':id/reactivar')
@Auth([TipoRol.ADMIN])
async reactivarPase(@Param('id') id: number) {
  return this.pasesAccesoService.reactivarPase(id);
}

// 7. Obtener todos los pases activos (Dashboard controlador)
@Get('activos')
@Auth([TipoRol.CONTROLADOR, TipoRol.ADMIN])
async obtenerPasesActivos() {
  return this.pasesAccesoService.findActivos();
}
```

---

### **5. DTOs**

#### **A. `ValidarQRDto`**
```typescript
export class ValidarQRDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  codigoQR: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  idControlador: number;

  @ApiProperty({ example: 'entrada', enum: ['entrada', 'salida'] })
  @IsEnum(['entrada', 'salida'])
  accion: string;
}
```

#### **B. `ResultadoValidacionDto`**
```typescript
export class ResultadoValidacionDto {
  @ApiProperty({ example: true })
  valido: boolean;

  @ApiProperty({ example: 'ACCESO_PERMITIDO' })
  motivo: string;

  @ApiProperty({ example: '✅ Acceso concedido' })
  mensaje: string;

  @ApiProperty({ required: false })
  pase?: {
    id: number;
    vecesUsado: number;
    ultimoUso: Date;
  };

  @ApiProperty({ required: false })
  reserva?: {
    id: number;
    cliente: string;
    cancha: string;
    horario: string;
  };
}
```

#### **C. `CreatePasesAccesoDto` (Mejorado)**
```typescript
export class CreatePasesAccesoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  idReserva: number;

  // Los demás campos se generan automáticamente
}
```

---

### **6. DEPENDENCIAS NECESARIAS**

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5",
    "@types/uuid": "^9.0.7"
  }
}
```

**Instalación:**
```bash
npm install qrcode uuid
npm install --save-dev @types/qrcode @types/uuid
```

---

### **7. CONFIGURACIÓN DEL MÓDULO**

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasesAcceso,
      Reserva,
      Controla,
      Controlador
    ]),
    forwardRef(() => ReservasModule),  // Para evitar dependencias circulares
  ],
  controllers: [PasesAccesoController],
  providers: [PasesAccesoService],
  exports: [PasesAccesoService]  // Para usar en ReservasModule
})
export class PasesAccesoModule {}
```

---

## 🔄 FLUJO COMPLETO (User Journey)

### **Caso de Uso: Cliente reserva y accede a una cancha**

```
1. Cliente crea RESERVA
   └─ POST /reservas
   └─ Estado: "Pendiente"

2. Cliente realiza PAGO
   └─ POST /transacciones
   └─ Estado Transacción: "completada"
   └─ Estado Reserva: "Confirmada" ✅

3. Sistema GENERA PASE automáticamente
   └─ Trigger: Reserva confirmada
   └─ Crea PasesAcceso con código QR único
   └─ Estado Pase: "pendiente"

4. Cliente DESCARGA QR
   └─ GET /pases-acceso/reserva/:idReserva/qr
   └─ Recibe imagen PNG o base64
   └─ Puede mostrar en app móvil o imprimir

5. Sistema ACTIVA PASE (automático)
   └─ Cron Job: 30 min antes de la reserva
   └─ Estado Pase: "activo" ✅

6. Cliente llega a la CANCHA
   └─ Muestra QR al controlador
   
7. Controlador ESCANEA QR
   └─ POST /pases-acceso/validar
   └─ Validaciones:
      ✓ QR existe
      ✓ Pase activo
      ✓ Dentro de horario válido
      ✓ No usado previamente
      ✓ Reserva confirmada
   
8. Si VÁLIDO:
   └─ Estado Pase: "usado"
   └─ Registro en tabla Controla
   └─ ✅ Acceso permitido
   
9. Si INVÁLIDO:
   └─ Motivo específico (expirado, cancelado, etc.)
   └─ ❌ Acceso denegado
   └─ Registro en tabla Controla con resultado "rechazado"

10. Cliente USA la cancha
    └─ Juega durante el horario reservado

11. Cliente SALE (opcional)
    └─ Escaneo de salida
    └─ Registro en Controla con acción "salida"

12. Sistema marca RESERVA COMPLETADA
    └─ completadaEn: timestamp
    └─ Estado Reserva: "Completada"

13. Sistema EXPIRA PASE (automático)
    └─ Cron Job: después de validoHasta
    └─ Estado Pase: "expirado"
```

---

## 🎨 INTERFAZ MÓVIL/WEB (Sugerencias)

### **Vista del Cliente:**
```
┌─────────────────────────────────┐
│  🎾 Mi Reserva                   │
├─────────────────────────────────┤
│  Cancha: Fútbol 5 - Sede Norte  │
│  📅 06/11/2025 - 18:00-19:00     │
│  💰 $50.00                       │
│  ✅ Confirmada y Pagada          │
├─────────────────────────────────┤
│       [Código QR Grande]         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│  ▓▓        QR CODE        ▓▓   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
├─────────────────────────────────┤
│  🟢 Válido desde: 17:30          │
│  🔴 Válido hasta: 19:30          │
├─────────────────────────────────┤
│  [📥 Descargar QR]               │
│  [📧 Enviar por Email]           │
└─────────────────────────────────┘
```

### **Vista del Controlador (Scanner):**
```
┌─────────────────────────────────┐
│  📸 Escanear Código QR           │
├─────────────────────────────────┤
│     [Visor de Cámara]            │
│                                  │
│    Apunte a un código QR        │
│                                  │
├─────────────────────────────────┤
│  Último escaneo:                 │
│  ✅ Juan Pérez                   │
│  Cancha 3 - 18:00                │
│  Acceso concedido ✓              │
└─────────────────────────────────┘
```

---

## 🔒 SEGURIDAD

### **Medidas Implementadas:**

1. **Códigos únicos no predecibles**
   - UUID v4 (128 bits de aleatoriedad)
   - Hash SHA-256 adicional

2. **Validación temporal estricta**
   - Ventana de 30 min antes/después
   - Expiración automática

3. **Uso único por defecto**
   - Contador `vecesUsado`
   - Límite configurable `usoMaximo`

4. **Trazabilidad completa**
   - Tabla `Controla` registra cada escaneo
   - Incluye: quién, cuándo, qué acción, resultado

5. **Autorización por roles**
   - Solo controladores pueden validar
   - Solo clientes/admin pueden generar QR

6. **Invalidación en cascada**
   - Cancelar reserva → cancela pase automáticamente

---

## 📈 MÉTRICAS Y REPORTES (Futuro)

### **KPIs a Trackear:**
- Tasa de uso de pases generados
- Tiempo promedio entre generación y primer uso
- Cantidad de intentos de acceso fallidos por motivo
- Pases expirados sin usar
- Controladores más activos

### **Reportes Sugeridos:**
```sql
-- Pases generados vs usados por día
SELECT DATE(creadoEn), 
       COUNT(*) as total,
       SUM(CASE WHEN estado = 'usado' THEN 1 ELSE 0 END) as usados
FROM pases_acceso
GROUP BY DATE(creadoEn);

-- Top motivos de rechazo
SELECT resultado, COUNT(*) as cantidad
FROM controla
WHERE resultado = 'rechazado'
GROUP BY resultado
ORDER BY cantidad DESC;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Estructura Base**
- [ ] Actualizar entidad `PasesAcceso` (agregar columnas nuevas)
- [ ] Crear enum `EstadoPaseAcceso`
- [ ] Crear DTOs: `ValidarQRDto`, `ResultadoValidacionDto`
- [ ] Instalar dependencias: `qrcode`, `uuid`

### **Fase 2: Lógica de Negocio**
- [ ] Implementar `generarPaseParaReserva()`
- [ ] Implementar `generarImagenQR()`
- [ ] Implementar `validarQR()` con todas las validaciones
- [ ] Implementar gestión de estados

### **Fase 3: Integración**
- [ ] Modificar `ReservasService` para crear pase al confirmar
- [ ] Modificar `ReservasService` para invalidar pase al cancelar
- [ ] Actualizar `PasesAccesoModule` con imports necesarios
- [ ] Exportar servicio para uso en otros módulos

### **Fase 4: API Endpoints**
- [ ] Crear endpoint `GET /pases-acceso/reserva/:id`
- [ ] Crear endpoint `GET /pases-acceso/:id/qr`
- [ ] Crear endpoint `GET /pases-acceso/:id/qr-base64`
- [ ] Crear endpoint `POST /pases-acceso/validar`
- [ ] Crear endpoint `GET /pases-acceso/:id/historial`
- [ ] Crear endpoint `GET /pases-acceso/activos`

### **Fase 5: Automatización**
- [ ] Implementar Cron Job para activar pases
- [ ] Implementar Cron Job para expirar pases
- [ ] Configurar @nestjs/schedule si no está instalado

### **Fase 6: Testing**
- [ ] Probar generación de pase al confirmar reserva
- [ ] Probar generación de imagen QR
- [ ] Probar validación exitosa
- [ ] Probar todos los casos de rechazo
- [ ] Probar transiciones de estados
- [ ] Probar cancelación de reserva → invalidar pase

### **Fase 7: Documentación**
- [ ] Documentar endpoints en Swagger
- [ ] Crear ejemplos de request/response
- [ ] Documentar códigos de error
- [ ] Crear guía de integración para frontend

---

## 🎯 CRITERIOS DE ÉXITO

- ✅ Cada reserva confirmada genera automáticamente un pase QR
- ✅ El QR se puede descargar como imagen PNG o base64
- ✅ El sistema valida correctamente todos los escenarios (válido/inválido)
- ✅ Los pases se activan/expiran automáticamente según horarios
- ✅ Cada validación queda registrada en la tabla `Controla`
- ✅ Cancelar una reserva invalida automáticamente su pase
- ✅ Solo usuarios autorizados pueden validar QRs
- ✅ El código QR es único, seguro y no predecible

---

## 📚 REFERENCIAS TÉCNICAS

**Librerías:**
- [qrcode npm](https://www.npmjs.com/package/qrcode)
- [uuid npm](https://www.npmjs.com/package/uuid)
- [crypto Node.js](https://nodejs.org/api/crypto.html)

**NestJS:**
- [Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
- [TypeORM Relations](https://typeorm.io/relations)

---

## 🚀 PRÓXIMOS PASOS

Una vez aprobada esta planificación, procederemos con:

1. **Implementación fase por fase**
2. **Testing exhaustivo de cada funcionalidad**
3. **Integración con el módulo de reservas**
4. **Documentación de APIs**
5. **Pruebas end-to-end**

---

**Estado:** ⏳ **Esperando aprobación para comenzar implementación**

