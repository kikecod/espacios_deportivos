// duenio.entity.ts
import { Persona } from 'src/personas/entities/personas.entity';
import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('duenio')
export class Duenio {
  @PrimaryColumn({ type: 'int' })
  idPersonaD: number; // PK y FK, NO generado

  @OneToOne(() => Persona, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idPersonaD', referencedColumnName: 'idPersona' })
  persona: Persona;

  @Column({ type: 'boolean', default: false })
  verificado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verificadoEn?: Date;

  @Column({ type: 'text', nullable: true })
  imagenCi?: string;

  @Column({ type: 'text', nullable: true })
  imgfacial?: string;
}
