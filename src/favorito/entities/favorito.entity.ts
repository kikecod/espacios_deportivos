import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, Column, Index, Unique } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Cancha } from '../../cancha/entities/cancha.entity';

@Entity('favorito')
@Unique('uq_cliente_cancha', ['idCliente', 'idCancha'])
@Index('idx_cliente_favorito', ['idCliente'])
@Index('idx_cancha_favorito', ['idCancha'])
export class Favorito {
  @PrimaryColumn()
  idCancha: number;

  @PrimaryColumn()
  idCliente: number;

  @CreateDateColumn({ type: 'timestamp' })
  creadoEn: Date;

  @Column({ type: 'boolean', default: true })
  notificacionesActivas: boolean;

  @Column({ type: 'jsonb', nullable: true })
  etiquetas?: string[];

  @Column({ type: 'text', nullable: true })
  notas?: string | null;

  @ManyToOne(() => Cliente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCliente' })
  cliente: Cliente;

  @ManyToOne(() => Cancha, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCancha'})
  cancha: Cancha;
}