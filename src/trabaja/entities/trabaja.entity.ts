import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Entity({ name: 'trabaja' })
export class Trabaja {
  @PrimaryColumn({ type: 'int' })
  idPersonaOpe: number;

  @PrimaryColumn({ type: 'int' })
  idSede: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', nullable: true })
  asignadoDesde: Date;

  @Column({ type: 'timestamp', nullable: true })
  asignadoHasta: Date;

  @ManyToOne(() => Controlador, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPersonaOpe' })
  controlador: Controlador;

  @ManyToOne(() => Sede, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idSede' })
  sede: Sede;
}
