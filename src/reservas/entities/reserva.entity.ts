import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Cancha } from 'src/cancha/entities/cancha.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Participa } from 'src/participa/entities/participa.entity';
import { Cancelacion } from 'src/cancelacion/entities/cancelacion.entity';
import { Controla } from 'src/controla/entities/controla.entity';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';

@Entity('reserva')
export class Reserva {
  @PrimaryGeneratedColumn()
  id_reserva: number;

  // --- FK Cliente
  @Column({ type: 'int', nullable: false })
  id_cliente: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  // --- FK Cancha
  @Column({ type: 'int', nullable: false })
  id_cancha: number;

  @ManyToOne(() => Cancha, (cancha) => cancha.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cancha' })
  cancha: Cancha;

  @Column({ type: 'timestamp', nullable: false })
  inicia_en: Date;

  @Column({ type: 'timestamp', nullable: false })
  termina_en: Date;

  @Column({ type: 'int', nullable: false })
  cantidad_personas: number;

  @Column({ type: 'boolean', nullable: false })
  requiere_aprobacion: boolean;

  @Column({ type: 'float', nullable: false })
  monto_base: number;

  @Column({ type: 'float', nullable: false })
  monto_extra: number;

  @Column({ type: 'float', nullable: false })
  monto_total: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @Column({ length: 100, nullable: false, default: 'Pendiente' })
  estado: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date | null;

  @OneToMany(() => Participa, (p) => p.reserva)
  participaciones: Participa[];

  @OneToMany(() => Cancelacion, (c) => c.reserva)
  cancelaciones: Cancelacion[];

  @OneToMany(() => Controla, (controla) => controla.reserva)
  controla: Controla[];
  
  @OneToMany(() =>  PasesAcceso, (paseAcceso) => paseAcceso.reserva)
  pasesAcceso: PasesAcceso[];

  @OneToMany(() => Transaccion, (transaccion) => transaccion.reserva)
  transacciones: Transaccion[];
}
