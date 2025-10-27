import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';

@Entity('bloqueo_cancha')
export class BloqueoCancha {
  @PrimaryGeneratedColumn()
  id_bloqueo: number;

  @Column({ type: 'int', nullable: false })
  id_cancha: number;

  @ManyToOne(() => Cancha, (cancha) => cancha.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cancha' })
  cancha: Cancha;

  @Column({ type: 'timestamp', nullable: false })
  inicia_en: Date;

  @Column({ type: 'timestamp', nullable: false })
  termina_en: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  motivo: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;
}
