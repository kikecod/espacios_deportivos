import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Participa } from "src/participa/entities/participa.entity";




@Entity()
export class Reserva {
    @PrimaryGeneratedColumn()
    idReserva: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.idCliente)
    @JoinColumn({ name: 'idCliente' })
    @Column({ type: 'int', nullable: false })
    idCliente: number;
    
    @ManyToOne(() => Cancha, (cancha) => cancha.idCancha)
    @JoinColumn({ name: 'idCancha' })
    idCancha: number;

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

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizadoEn: Date;

    @OneToMany(() => Participa, (p) => p.reserva)
    participaciones: Participa[];

}