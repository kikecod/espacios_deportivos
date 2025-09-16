import { Column, DeleteDateColumn, Entity } from "typeorm";

@Entity()
export class Cancha {

    @Column({ primary: true, generated: true })
    idCancha: number;

    @Column({ type: 'int', nullable: false })
    idSede: number;

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
