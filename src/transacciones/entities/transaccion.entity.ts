import { Reserva } from 'src/reservas/entities/reserva.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Transaccion {
  @PrimaryGeneratedColumn()
  id_transaccion: number;

  @ManyToOne(() => Reserva, (Reserva) => Reserva.transacciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Reserva;

  @Column({ length: 200, nullable: false })
  pasarela: string;

  @Column({ length: 100, nullable: false })
  metodo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  monto: number;

  @Column({ length: 50, nullable: false })
  estado: string;

  @Column({ length: 100, nullable: false })
  id_externo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  comision_pasarela: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  comision_plataforma: number;

  @Column({ length: 40, nullable: false })
  moneda_liquidada: string;

  @Column({ length: 100, nullable: false })
  codigo_autorizacion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  capturado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  rembolsado_en: Date;
}
