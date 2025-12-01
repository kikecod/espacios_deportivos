import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, Column, Index, Unique } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Sede } from '../../sede/entities/sede.entity';

@Entity('favorito')
@Unique('uq_cliente_sede', ['idCliente', 'idSede'])
@Index('idx_cliente_favorito', ['idCliente'])
@Index('idx_sede_favorito', ['idSede'])
export class Favorito {
  @PrimaryColumn()
  idSede: number;

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

  @ManyToOne(() => Sede, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idSede' })
  sede: Sede;
}