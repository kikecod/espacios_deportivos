import { Participa } from "src/participa/entities/participa.entity";
import { Persona } from "src/personas/entities/personas.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity('cliente')
export class Cliente {
  
  @PrimaryColumn()
  idCliente: number;

  @OneToOne(() => Persona, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "idCliente" })
  persona: Persona;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apodo?: string;

  @Column({ type: 'int', default: 1 })
  nivel: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @OneToMany(() => Participa, (p) => p.cliente)
  participaciones: Participa[];

}
