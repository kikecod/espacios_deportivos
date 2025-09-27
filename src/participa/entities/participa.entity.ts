import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Entity('participa')
export class Participa {
  @PrimaryColumn()
  idReserva: number;

  @PrimaryColumn()
  idCliente: number;

  @Column({ type: 'boolean', default: false })
  confirmado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  checkInEn?: Date;

  @ManyToOne(() => Reserva, (reserva) => reserva.participaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idReserva' })
  reserva: Reserva;

  @ManyToOne(() => Cliente, (cliente) => cliente.participaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idCliente' })
  cliente: Cliente;
}
