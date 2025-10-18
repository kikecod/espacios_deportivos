import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';

@Entity('cancelacion')
export class Cancelacion {
  @PrimaryGeneratedColumn()
  id_cancelacion: number;

  @Column()
  id_cliente: number;

  @Column()
  id_reserva: number;

  @CreateDateColumn({ type: 'timestamp', name: 'cancelada_en', default: () => 'CURRENT_TIMESTAMP' })
  cancelada_en: Date;
  
  @Column({ type: 'text', nullable: true })
  motivo?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  canal?: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.cancelaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @ManyToOne(() => Reserva, (reserva) => reserva.cancelaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Reserva;
}
