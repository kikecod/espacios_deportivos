import { CalificaCancha } from "src/califica_cancha/entities/califica_cancha.entity";
import { Cancelacion } from "src/cancelacion/entities/cancelacion.entity";
import { Denuncia } from "src/denuncia/entities/denuncia.entity";
import { Participa } from "src/participa/entities/participa.entity";
import { Persona } from "src/personas/entities/personas.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

@Entity('cliente')
export class Cliente {
  
  @PrimaryColumn({name: 'id_cliente'})
  id_cliente: number;

  @OneToOne(() => Persona, { eager: true })
  @JoinColumn({ name: 'id_cliente' })
  persona: Persona;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apodo?: string;

  @Column({ type: 'int', default: 1 })
  nivel: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @OneToMany(() => Participa, (p) => p.cliente)
  participaciones: Participa[];

  @OneToMany(() => Cancelacion, (cancelacion) => cancelacion.cliente)
  cancelaciones: Cancelacion[];

  @OneToMany(() => Reserva, (reserva) => reserva.cliente)
  reservas: Reserva[];
  
  @OneToMany(() => CalificaCancha, calificaCancha => calificaCancha.cliente)
  calificaciones: CalificaCancha[];
  
  @OneToMany(() => Denuncia, denuncia => denuncia.cliente)
  denuncias: Denuncia[];

}
