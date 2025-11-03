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
import { CalificaCancha } from 'src/califica_cancha/entities/califica_cancha.entity';
import e from 'express';

@Entity('reserva')
export class Reserva {
  @PrimaryGeneratedColumn()
  idReserva: number;

  // --- FK Cliente
  @Column({ type: 'int', nullable: false })
  idCliente: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCliente' })
  cliente: Cliente;

  // --- FK Cancha
  @Column({ type: 'int', nullable: false })
  idCancha: number;

  @ManyToOne(() => Cancha, (cancha) => cancha.reservas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCancha' })
  cancha: Cancha;

  @Column({ type: 'timestamp', nullable: false })
  iniciaEn: Date;

  @Column({ type: 'timestamp', nullable: false })
  terminaEn: Date;

  @Column({ type: 'int', nullable: false })
  cantidadPersonas: number;

  @Column({ type: 'boolean', nullable: false })
  requiereAprobacion: boolean;

  @Column({ type: 'float', nullable: false })
  montoBase: number;

  @Column({ type: 'float', nullable: false })
  montoExtra: number;

  @Column({ type: 'float', nullable: false })
  montoTotal: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column({ length: 100, nullable: false, default: 'Pendiente' })
  estado: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date | null;

  @OneToMany(() => Participa, (p) => p.reserva)
  participaciones: Participa[];

  @OneToMany(() => Cancelacion, (c) => c.reserva)
  cancelaciones: Cancelacion[];

  @OneToMany(() => Controla, (controla) => controla.reserva)
  controlas: Controla[];
  
  @OneToMany(() =>  PasesAcceso, (paseAcceso) => paseAcceso.reserva)
  pasesAcceso: PasesAcceso[];

  @OneToMany(() => Transaccion, (transaccion) => transaccion.reserva, {eager: true})
  transacciones: Transaccion[];

  @OneToMany(() => CalificaCancha, (calif) => calif.reserva)
  calificaciones: CalificaCancha[];
}
