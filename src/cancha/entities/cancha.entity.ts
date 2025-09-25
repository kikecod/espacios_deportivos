import { Sede } from "src/sede/entities/sede.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PrimaryColumn } from "typeorm/browser";

@Entity()
export class Cancha {

    @PrimaryGeneratedColumn()
    idCancha: number;

    @Column({ name: 'idSede' })
    id_Sede: number;

    @ManyToOne(() => Sede, (sede) => sede.canchas)
    @JoinColumn({ name: 'idSede' })
    sede: Sede;

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

}
