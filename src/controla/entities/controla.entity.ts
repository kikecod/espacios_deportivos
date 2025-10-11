import { Controlador } from "src/controlador/entities/controlador.entity";
import { PasesAcceso } from "src/pases_acceso/entities/pases_acceso.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity()
export class Controla {
    @PrimaryColumn({ name: 'idPersonaOpe' })
    idPersonaOpe: number;

    @PrimaryColumn({ name: 'idReserva' })
    idReserva: number;

    @PrimaryColumn({ name: 'idPaseAcceso' })
    idPaseAcceso: number;

    @ManyToOne(() => Controlador, controlador => controlador.controlas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPersonaOpe' })
    controlador: Controlador;

    @ManyToOne(() => Reserva, reserva => reserva.controlas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idReserva' })
    reserva: Reserva;

    @ManyToOne(() => PasesAcceso, pase => pase.controlas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPaseAcceso' })
    paseAcceso: PasesAcceso;

    @Column()
    accion: string;

    @Column()
    resultado: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;
}
