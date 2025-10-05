import { Reserva } from "src/reservas/entities/reserva.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('transaccion')
export class Transaccion {
    
    @PrimaryGeneratedColumn()
    idTransaccion: number;

    @ManyToOne(() => Reserva, (idReserva) => idReserva)
    @JoinColumn({ name: 'idReserva' })
    @Column({ type: 'int', nullable: false })
    idReserva: number;

    @Column({ length: 200, nullable: false })
    pasarela: string;

    @Column({ length: 100, nullable: false })
    metodo: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    monto: number;

    @Column({ length: 50, nullable: false })
    estado: string;

    @Column({ length: 100, nullable: false })
    idExterno: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    comisionPasarela: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    comisionPlataforma: number;

    @Column({ length: 40, nullable: false })
    monedaLiquidada: string;

    @Column({ length: 100, nullable: false })
    codigoAutorizacion: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    capturadoEn: Date;

    @Column({ type: 'timestamp', nullable: true })
    rembolsadoEn: Date;
}
