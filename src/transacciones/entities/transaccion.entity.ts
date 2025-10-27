import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransaccionFactura } from './transaccion-factura.entity';

@Entity('transacciones')
export class Transaccion {
  @PrimaryGeneratedColumn()
  id_transaccion: number;

  @Column({ name: 'id_transaccion_libelula', length: 150, unique: true })
  id_transaccion_libelula: string;

  @Column({ name: 'url_pasarela_pagos', type: 'text' })
  url_pasarela_pagos: string;

  @Column({ name: 'qr_simple_url', type: 'text', nullable: true })
  qr_simple_url: string | null;

  @Column({ name: 'estado_pago', length: 50 })
  estado_pago: string;

  @Column({ name: 'fecha_pago', type: 'timestamp', nullable: true })
  fecha_pago: Date | null;

  @Column({
    name: 'monto_total',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) =>
        value !== null && value !== undefined ? Number(value) : null,
    },
  })
  monto_total: number;

  @Column({ name: 'cliente_id' })
  cliente_id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.transacciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'reserva_id' })
  reserva_id: number;

  @ManyToOne(() => Reserva, (reserva) => reserva.transacciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva;

  @OneToMany(
    () => TransaccionFactura,
    (factura) => factura.transaccion,
    { cascade: true },
  )
  facturas: TransaccionFactura[];
}
