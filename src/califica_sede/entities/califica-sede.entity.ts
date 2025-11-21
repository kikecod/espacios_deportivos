import { Cliente } from "src/clientes/entities/cliente.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity('CalificaSede')
export class CalificaSede {

  // ============================================
  // CLAVE PRIMARIA: idCliente + idSede
  // Un cliente solo puede reseñar una sede UNA VEZ
  // ============================================
  @PrimaryColumn()
  idCliente: number;

  @PrimaryColumn()
  idSede: number;

  // ============================================
  // RELACIÓN CON RESERVA (para validación de 14 días)
  // ============================================
  @Column({ nullable: false })
  idReserva: number;

  @ManyToOne(() => Reserva, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idReserva' })
  reserva: Reserva;

  // ============================================
  // RELACIONES PRINCIPALES
  // ============================================
  @ManyToOne(() => Cliente, cliente => cliente.calificaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCliente' })
  cliente: Cliente;

  @ManyToOne(() => Sede, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idSede' })
  sede: Sede;

  // ============================================
  // CALIFICACIÓN GENERAL
  // ============================================
  @Column({ type: 'int', nullable: false })
  puntajeGeneral: number;  // 1-5 estrellas (obligatorio)

  // ============================================
  // ASPECTOS ESPECÍFICOS DE LA SEDE (opcionales)
  // ============================================
  @Column({ type: 'int', nullable: true })
  atencion: number;  // Calidad de atención del personal

  @Column({ type: 'int', nullable: true })
  instalaciones: number;  // Estado general de instalaciones

  @Column({ type: 'int', nullable: true })
  ubicacion: number;  // Accesibilidad y ubicación

  @Column({ type: 'int', nullable: true })
  estacionamiento: number;  // Disponibilidad de estacionamiento

  @Column({ type: 'int', nullable: true })
  vestuarios: number;  // Estado de vestuarios y duchas

  @Column({ type: 'int', nullable: true })
  limpieza: number;  // Limpieza general del lugar

  @Column({ type: 'int', nullable: true })
  seguridad: number;  // Seguridad del lugar

  // ============================================
  // COMENTARIO
  // ============================================
  @Column({ type: 'text', nullable: true })
  comentario: string;  // Comentario opcional

  // ============================================
  // METADATA
  // ============================================
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCalificacion: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;

  @Column({ type: 'timestamp', nullable: true })
  eliminadoEn: Date;
}
