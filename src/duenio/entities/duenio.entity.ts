import { Persona } from "src/personas/personas.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("duenio")
export class Duenio {
    @PrimaryColumn()
    idPersonaD: number;

    @OneToOne(() => Persona, (persona) => persona.duenio , { eager: true })
    @JoinColumn({ name: 'idPersonaD' })
    persona: Persona;

    @Column({ type: 'boolean', default: false })
    verificado: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    verificadoEn: Date;

    @Column({ length: 100, nullable: false })
    imagenCI: string;

    @Column({ length: 100, nullable: false })
    imagenFacial: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;

    @OneToMany(() => Sede, sede => sede.duenio, {eager: true})
    sedes: Sede[]
}
