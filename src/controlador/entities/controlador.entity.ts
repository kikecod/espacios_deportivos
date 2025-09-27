import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, RelationId } from "typeorm";
import { Persona } from "src/personas/entities/personas.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { SedeController } from "src/sede/sede.controller";
import { Controla } from "src/controla/entities/controla.entity";


@Entity()
export class Controlador {
    @PrimaryColumn()
    idPersonaOpe: number;

    @ManyToOne(() => Persona, persona => persona.controlador, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idPersonaOpe'})
    persona: Persona;

    @RelationId((controlador: Controlador) => controlador.persona)
    idPersona: number;

    @ManyToOne(() => Sede, sede => SedeController)
    @JoinColumn({ name: 'idSede' })
    sede: Sede;

    @Column({ length: 100, nullable: false })
    codigoEmpleado: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ length: 100, nullable: false })
    turno: string;

    @OneToMany(() => Controla, controla => controla.controlador)
    controlas: Controla[];
}
