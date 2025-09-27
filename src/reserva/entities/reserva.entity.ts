import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/cliente/entities/cliente.entity";
import { Controla } from "src/controla/entities/controla.entity";
import { PaseAcceso } from "src/pase_acceso/entities/pase_acceso.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Reserva {

    @PrimaryGeneratedColumn()
    idReserva: number;

    @ManyToOne(() => Cliente, Cliente => Cliente.reservas, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCliente'})
    cliente: Cliente;

    @ManyToOne(() => Cancha, (Cancha) => Cancha.reservas, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCancha'})
    cancha: Cancha;

    @ManyToOne(() => Sede, (Sede) => Sede.reservas, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idSede'})
    sede: Sede;

    @Column({ type: 'timestamp', nullable: false })
    iniciaEn: Date;

    @Column({ type: 'timestamp', nullable: false })
    terminaEn: Date;

    @Column({ type: 'int', nullable: false })
    cantidadPersonas: number;

    @Column({ type: 'boolean', nullable: false })
    requiereAprobacion: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    montoBase: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    montoTotal: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizadoEn: Date;

    // Relaciones inversas
    @OneToMany(() => PaseAcceso, (pase) => pase.reserva)
    pasesAcceso: PaseAcceso[];

    @OneToMany(() => Controla, (controla) => controla.reserva)
    controlas: Controla[];

}
