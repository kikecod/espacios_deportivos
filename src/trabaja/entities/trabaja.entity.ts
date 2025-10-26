import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Sede } from 'src/sede/entities/sede.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('trabaja')
export class Trabaja {
  @PrimaryColumn({ name: 'id_persona_ope', type: 'int' })
  id_persona_ope: number;

  @PrimaryColumn({ name: 'id_sede', type: 'int' })
  id_sede: number;

  @ManyToOne(() => Controlador, (controlador) => controlador.trabaja, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_persona_ope' })
  controlador: Controlador;

  @ManyToOne(() => Sede, (sede) => sede.trabaja, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sede' })
  sede: Sede;

  @Column({ type: 'date', nullable: false, name: 'fecha_inicio' })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true, name: 'fecha_fin' })
  fecha_fin: Date | null;

  @Column({ type: 'boolean', default: true, name: 'activo' })
  activo: boolean;
}
