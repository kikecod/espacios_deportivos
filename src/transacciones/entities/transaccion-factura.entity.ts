import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaccion } from './transaccion.entity';

@Entity('transaccion_factura')
export class TransaccionFactura {
  @PrimaryGeneratedColumn()
  id_factura: number;

  @Column({ name: 'transaccion_id' })
  transaccion_id: number;

  @ManyToOne(() => Transaccion, (transaccion) => transaccion.facturas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaccion_id' })
  transaccion: Transaccion;

  @Column({ name: 'invoice_id', length: 120 })
  invoice_id: string;

  @Column({ name: 'invoice_url', type: 'text' })
  invoice_url: string;

  @Column({ name: 'payload', type: 'jsonb', nullable: true })
  payload?: Record<string, unknown>;
}
