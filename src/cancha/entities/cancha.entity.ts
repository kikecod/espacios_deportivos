import { Foto } from "src/fotos/entities/foto.entity";
import { Parte } from "src/parte/entities/parte.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PrimaryColumn } from "typeorm/browser";
import { CalificaCancha } from "src/califica_cancha/entities/califica_cancha.entity";
import { Denuncia } from "src/denuncia/entities/denuncia.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";

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

    @Column({ type: 'time', nullable: false, default: '06:00:00' })
    horaApertura: string;

    @Column({ type: 'time', nullable: false, default: '23:00:00' })
    horaCierre: string;

    // ============================================
    // RATING Y RESEÑAS
    // ============================================
    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
    ratingPromedio: number;

    @Column({ type: 'int', default: 0 })
    totalResenas: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;

    @OneToMany(() => Parte, (parte) => parte.cancha, {eager: true})
    parte: Parte[];

    @OneToMany(() => Foto, (foto) => foto.cancha, {eager: true})
    fotos: Foto[];

    @OneToMany(() => Reserva, (reserva) => reserva.cancha, {eager: true})
    reservas: Reserva[];

    @OneToMany(() => CalificaCancha, calificaCancha => calificaCancha.cancha)
    calificaciones: CalificaCancha[];

    @OneToMany(() => Denuncia, denuncia => denuncia.cancha)
    denuncias: Denuncia[];

}
