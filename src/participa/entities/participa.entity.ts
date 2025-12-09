import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reserva } from 'src/reservas/entities/reserva.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

export type TipoAsistente =
  | 'titular'
  | 'invitado_registrado'
  | 'invitado_no_registrado'
  | 'desconocido';

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

  @Column({
    type: 'varchar',
    length: 40,
    default: 'invitado_registrado',
  })
  tipoAsistente: TipoAsistente;

  @Column({ type: 'varchar', length: 200, nullable: true })
  nombreMostrar?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  correoInvitacion?: string | null;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

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
