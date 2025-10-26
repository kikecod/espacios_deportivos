import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Sede } from 'src/sede/entities/sede.entity';

@Entity('denuncia')
export class Denuncia {
  @PrimaryColumn({ name: 'id_cliente', type: 'int' })
  id_cliente: number;

  @PrimaryColumn({ name: 'id_cancha', type: 'int' })
  id_cancha: number;

  @PrimaryColumn({ name: 'id_sede', type: 'int' })
  id_sede: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.denuncias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @ManyToOne(() => Cancha, (cancha) => cancha.denuncias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cancha' })
  cancha: Cancha;

  @ManyToOne(() => Sede, (sede) => sede.denuncias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sede' })
  sede: Sede;

  @Column({ type: 'varchar', length: 50 })
  categoria: string;

  @Column({ type: 'varchar', length: 50 })
  gravedad: string;

  @Column({ type: 'varchar', length: 30, default: 'pendiente' })
  estado: string;

  @Column({ type: 'varchar', length: 120 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'asignado_a', type: 'varchar', length: 120, nullable: true })
  asignado_a: string | null;

  @Column({
    name: 'creado_en',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creado_en: Date;

  @Column({ name: 'actualizado_en', type: 'timestamp', nullable: true })
  actualizado_en: Date | null;
}
