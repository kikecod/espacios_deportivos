import { CalificaCancha } from "src/califica_cancha/entities/califica_cancha.entity";
import { Denuncia } from "src/denuncia/entities/denuncia.entity";
import { Reserva } from "src/reserva/entities/reserva.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PrimaryColumn } from "typeorm/browser";

@Entity()
export class Cancha {

    @PrimaryGeneratedColumn()
    idCancha: number;

    @ManyToOne(() => Sede, (sede) => sede.idSede)
    @JoinColumn({ name: 'idSede' })
    id_Sede: number;

    @Column({ length: 100, nullable: false })
    nombre: string;

    @Column({ length: 100, nullable: false })
    superficie: string;

    @Column({ type: 'boolean', nullable: false })
    cubierta: boolean;

    @Column({ type: 'int', nullable: false })
    aforoMax: number;

    @Column({ length: 100, nullable: false })
    dimensiones: string;

    @Column({ length: 100, nullable: false })
    reglasUso: string;

    @Column({ length: 100, nullable: false })
    iluminacion: string;

    @Column({ length: 100, nullable: false })
    estado: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precio: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;

    // Relación con Reserva (una cancha puede tener muchas reservas)
    @OneToMany(() => Reserva, reserva => reserva.cancha)
    reservas: Reserva[];

    @OneToMany(() => CalificaCancha, calificaCancha => calificaCancha.cancha)
    calificaciones: CalificaCancha[];

    @OneToMany(() => Denuncia, denuncia => denuncia.cancha)
    denuncias: Denuncia[];

}
