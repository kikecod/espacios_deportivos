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
    id_cancha: number;

    @Column()
    id_sede: number;

    @ManyToOne(() => Sede, (sede) => sede.canchas)
    @JoinColumn({ name: 'id_sede' })
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
    reglas_uso: string;

    @Column({ length: 100, nullable: false })
    iluminacion: string;

    @Column({ length: 100, nullable: false })
    estado: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    precio: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creado_en: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizado_en: Date;

    @DeleteDateColumn()
    eliminado_en: Date;

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
