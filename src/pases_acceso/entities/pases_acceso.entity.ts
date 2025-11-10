import { JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entity, Column } from "typeorm";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Controla } from "src/controla/entities/controla.entity";

export enum EstadoPaseAcceso {
    PENDIENTE = 'pendiente',
    ACTIVO = 'activo',
    USADO = 'usado',
    EXPIRADO = 'expirado',
    CANCELADO = 'cancelado'
}

@Entity('pases_acceso')
export class PasesAcceso {

    @PrimaryGeneratedColumn()
    idPaseAcceso: number;

    @Column({ type: 'int', nullable: false })
    idReserva: number;

    @ManyToOne(() => Reserva, (reserva) => reserva.pasesAcceso, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idReserva' })
    reserva: Reserva;

    @Column({ length: 500, nullable: false, unique: true })
    codigoQR: string;

    @Column({ length: 200, nullable: false, unique: true })
    hashCode: string;

    @Column({ type: 'timestamp', nullable: false })
    validoDesde: Date;

    @Column({ type: 'timestamp', nullable: false })
    validoHasta: Date;

    @Column({ 
        type: 'varchar',
        length: 50,
        nullable: false,
        default: EstadoPaseAcceso.PENDIENTE
    })
    estado: EstadoPaseAcceso;

    @Column({ type: 'int', nullable: false, default: 0 })
    vecesUsado: number;

    @Column({ type: 'int', nullable: false, default: 1 })
    usoMaximo: number;

    @Column({ type: 'timestamp', nullable: true })
    primerUsoEn: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    ultimoUsoEn: Date | null;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ 
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    actualizadoEn: Date;

    @OneToMany(() => Controla, (controla) => controla.paseAcceso)
    controlas: Controla[];
}
