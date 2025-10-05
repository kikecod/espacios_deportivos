import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Persona } from "src/personas/entities/personas.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Controla } from "src/controla/entities/controla.entity";
import { Trabaja } from "src/trabaja/entities/trabaja.entity";


@Entity('controlador')
export class Controlador {
    @PrimaryColumn()
    idPersonaOpe: number;

    @ManyToOne(() => Persona, persona => persona.controlador, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idPersonaOpe'})
    persona: Persona;

    @Column({ length: 100, nullable: false })
    codigoEmpleado: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ length: 100, nullable: false })
    turno: string;

    @OneToMany(
        () => Controla, 
        controla => controla.controlador,
        { cascade: true }
    )
    controlas: Controla;


    @OneToMany(
        () => Trabaja,
        (trabaja) => trabaja.controlador,
        { cascade: true }
    )
    trabaja: Trabaja;
}
