import { CalificaCancha } from 'src/califica_cancha/entities/califica_cancha.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';
import { Denuncia } from 'src/denuncia/entities/denuncia.entity';
import { Participa } from 'src/participa/entities/participa.entity';
import { Persona } from 'src/personas/entities/personas.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('cliente')
export class Cliente {
  // Shared primary key con Persona
  @PrimaryColumn({ type: 'int' })
  idCliente: number;

  @OneToOne(() => Persona, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'idCliente', referencedColumnName: 'idPersona' })
  persona: Persona[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  apodo?: string;

  @Column({ type: 'int', default: 1 })
  nivel: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @OneToMany(() => Participa, (participa) => participa.cliente)
  participaciones: Participa[];   // ← array

  @OneToMany(() => Cancelacion, (cancelacion) => cancelacion.cliente)
  cancelaciones: Cancelacion[];   // ← array

  @OneToMany(() => Reserva, (reserva) => reserva.cliente)
  reservas: Reserva[];            // ← array

  @OneToMany(() => CalificaCancha, (cc) => cc.cliente)
  calificaciones: CalificaCancha[]; // ← array

  @OneToMany(() => Denuncia, (denuncia) => denuncia.cliente)
  denuncias: Denuncia[];          // ← array
}
