import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, RelationId } from "typeorm";
import { Persona } from "src/personas/entities/personas.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { SedeController } from "src/sede/sede.controller";
import { Controla } from "src/controla/entities/controla.entity";
import { Trabaja } from "src/trabaja/entities/trabaja.entity";


@Entity()
export class Controlador {
    @PrimaryColumn()
    id_persona_ope: number;

    @ManyToOne(() => Persona, persona => persona.controlador, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'id_persona_ope'})
    persona: Persona;

    @RelationId((controlador: Controlador) => controlador.persona)
    id_persona: number;

    @ManyToOne(() => Sede, sede => SedeController)
    @JoinColumn({ name: 'id_sede' })
    sede: Sede;

    @Column({ length: 100, nullable: false })
    codigo_empleado: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ length: 100, nullable: false })
    turno: string;

    @OneToMany(() => Controla, controla => controla.controlador)
    controla: Controla[];

    @OneToMany(() => Trabaja, trabaja => trabaja.controlador)
    trabaja: Trabaja[];
}
