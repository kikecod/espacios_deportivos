import { JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity, Column } from "typeorm";
import { Reserva } from "src/reservas/entities/reserva.entity";

@Entity()
export class PasesAcceso {

    @PrimaryGeneratedColumn()
    idPaseAcceso: number;

    @ManyToOne(() => Reserva, (reserva) => reserva.idReserva)
    @JoinColumn({ name: 'idReserva' })
    @Column({ type: 'int', nullable: false })
    idReserva: number;

    @Column({ length: 200, nullable: false })
    hashCode: string;

    @Column({ type: 'timestamp', nullable: false })
    validoDesde: Date;

    @Column({ type: 'timestamp', nullable: false })
    validoHasta: Date;

    @Column({ length: 100 , nullable: false })
    estado: string;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;
}
