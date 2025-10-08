import { JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entity, Column } from "typeorm";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Controla } from "src/controla/entities/controla.entity";

@Entity()
export class PasesAcceso {

    @PrimaryGeneratedColumn()
    idPaseAcceso: number;

    @ManyToOne(() => Reserva, (reserva) => reserva.pasesAcceso, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idReserva' })
    reserva: Reserva;

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

    @OneToMany(() => Controla, (controla) => controla.paseAcceso)
    controlas: Controla[];
}
