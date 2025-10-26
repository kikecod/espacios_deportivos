import {
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Entity, Column } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Controla } from 'src/controla/entities/controla.entity';

@Entity()
export class PasesAcceso {
  @PrimaryGeneratedColumn()
  id_pase_acceso: number;

  @ManyToOne(() => Reserva, (reserva) => reserva.pasesAcceso, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Reserva;

  @Column({ length: 200, nullable: false })
  hash_code: string;

  @Column({ type: 'timestamp', nullable: false })
  valido_desde: Date;

  @Column({ type: 'timestamp', nullable: false })
  valido_hasta: Date;

  @Column({ length: 100, nullable: false })
  estado: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @OneToMany(() => Controla, (controla) => controla.paseAcceso)
  controla: Controla[];
}
