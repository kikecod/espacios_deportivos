import { Persona } from "src/personas/entities/personas.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("duenio")
export class Duenio {
    @PrimaryColumn()
    id_personaD: number;

    @OneToOne(() => Persona, (persona) => persona.duenio , { eager: true })
    @JoinColumn({ name: 'id_persona_d' })
    persona: Persona;

    @Column({ type: 'boolean', default: false })
    verificado: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    verificado_en: Date;

    @Column({ length: 100, nullable: false })
    imagen_ci: string;

    @Column({ length: 100, nullable: false })
    imagen_facial: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creado_en: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizado_en: Date;

    @DeleteDateColumn()
    eliminado_en: Date;

    @OneToMany(() => Sede, sede => sede.duenio, {eager: true})
    sedes: Sede[]
}
