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
  idCancelacion: number;

  @Column()
  idCliente: number;

  @Column()
  idReserva: number;

  @CreateDateColumn({ type: 'timestamp', name: 'canceladaEn', default: () => 'CURRENT_TIMESTAMP' })
  canceladaEn: Date;
  
  @Column({ type: 'text', nullable: true })
  motivo?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  canal?: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.cancelaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCliente' })
  cliente: Cliente;

  @ManyToOne(() => Reserva, (reserva) => reserva.cancelaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idReserva' })
  reserva: Reserva;
}
