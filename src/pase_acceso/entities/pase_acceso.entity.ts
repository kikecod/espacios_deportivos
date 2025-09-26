import { join } from "path";
import { Controla } from "src/controla/entities/controla.entity";
import { Reserva } from "src/reserva/entities/reserva.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class PaseAcceso {

    @PrimaryGeneratedColumn()
    idPaseAcceso: number;

    @ManyToOne(() => Reserva, (reserva) => reserva.pasesAcceso, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idReserva'})
    reserva: Reserva;

    @Column({ type: 'text', name: 'hashCode' })
    hashCode: string;

    @Column({ type: 'timestamp', name: 'validoDesde', nullable: true })
    validoDesde: Date;

    @Column({ type: 'timestamp', name: 'validoHasta', nullable: true })
    validoHasta: Date;

    @Column({ type: 'varchar', length: 20, default: 'activo' })
    estado: string;

    @Column({ type: 'timestamp', name: 'creadoEn', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    // Relaciones inversas
    @OneToMany(() => Controla, (controla) => controla.paseAcceso)
    controlas: Controla[];

}


