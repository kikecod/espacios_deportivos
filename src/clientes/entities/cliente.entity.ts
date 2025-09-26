import { Persona } from "src/personas/personas.entity";
import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryColumn()
    idCliente: number;

    @OneToOne(() => Persona)
    @JoinColumn({ name: 'idCliente', referencedColumnName: 'idPersona' })
    persona: Persona;
}