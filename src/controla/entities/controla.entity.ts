import { Controlador } from 'src/controlador/entities/controlador.entity';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Controla {
  @PrimaryColumn({ name: 'id_persona_ope' })
  id_persona_ope: number;

  @PrimaryColumn({ name: 'id_reserva' })
  id_reserva: number;

  @PrimaryColumn({ name: 'id_pase_acceso' })
  id_pase_acceso: number;

  @ManyToOne(() => Controlador, (controlador) => controlador.controla, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_persona_ope' })
  controlador: Controlador;

  @ManyToOne(() => Reserva, (reserva) => reserva.controla, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Reserva;

  @ManyToOne(() => PasesAcceso, (pase) => pase.controla, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pase_acceso' })
  paseAcceso: PasesAcceso;

  @Column()
  accion: string;

  @Column()
  resultado: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
}
