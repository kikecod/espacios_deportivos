import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Entity('participa')
export class Participa {
  @PrimaryColumn()
  id_reserva: number;

  @PrimaryColumn()
  id_cliente: number;

  @Column({ type: 'boolean', default: false })
  confirmado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  check_in_en?: Date;

  @ManyToOne(() => Reserva, (reserva) => reserva.participaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_reserva' })
  reserva: Reserva;

  @ManyToOne(() => Cliente, (cliente) => cliente.participaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;
}
