import { JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entity, Column, Index } from "typeorm";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Controla } from "src/controla/entities/controla.entity";

export enum EstadoPase {
  ACTIVO = 'ACTIVO',
  USADO = 'USADO',
  ANULADO = 'ANULADO',
}

@Entity()
export class PasesAcceso {

    @PrimaryGeneratedColumn()   
    idPaseAcceso: number;

    @Column({ type: 'int', nullable: false })
    idReserva: number;

    @ManyToOne(() => Reserva, (reserva) => reserva.pasesAcceso)
    @JoinColumn({ name: 'idReserva' })
    reserva: Reserva;

    @Index('IDX_pase_hash')
    @Column({ length: 200, nullable: false })
    hashCode: string;

    @Column({ type: 'timestamp', nullable: false })
    validoDesde: Date;

    @Column({ type: 'timestamp', nullable: false })
    validoHasta: Date;

    @Column({ type: 'enum', enum: EstadoPase, default: EstadoPase.ACTIVO })
    estado: EstadoPase;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @OneToMany(() => Controla, (controla) => controla.paseAcceso)
    controlas: Controla[];
}
