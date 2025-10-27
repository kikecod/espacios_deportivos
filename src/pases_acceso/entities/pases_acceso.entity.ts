import { Reserva } from 'src/reservas/entities/reserva.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Controla } from 'src/controla/entities/controla.entity';

@Entity('pase_acceso')
export class PasesAcceso {
  @PrimaryGeneratedColumn()
  id_pase_acceso: number;

  @Column({ name: 'id_reserva' })
  id_reserva: number;

  @ManyToOne(() => Reserva, (reserva) => reserva.pasesAcceso, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Reserva;

  @Column({ name: 'qr', type: 'text' })
  qr: string;

  @Column({ name: 'cantidad_personas', type: 'int' })
  cantidad_personas: number;

  @OneToMany(() => Controla, (controla) => controla.paseAcceso)
  controles: Controla[];
}
