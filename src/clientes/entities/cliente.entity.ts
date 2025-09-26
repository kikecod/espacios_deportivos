import { Persona } from "src/personas/entities/personas.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';


// -- Especializaciones de PERSONA
// CREATE TABLE CLIENTE (
//     idCliente INT PRIMARY KEY REFERENCES PERSONA(idPersona) ON DELETE CASCADE,
//     apodo VARCHAR(100),
//     nivel INT DEFAULT 1,
//     observaciones TEXT
// );

@Entity('clientes')
export class Cliente extends Persona {


    @PrimaryGeneratedColumn()
    idCliente: number;
    @OneToOne(() => Persona)
    @JoinColumn({ name: "idCliente" })
    persona: Persona;

    @Column({ type: 'varchar', length: 100, nullable: true })
    apodo?: string;

    @Column({ type: 'int', default: 1 })
    nivel: number;

    @Column({ type: 'text', nullable: true })
    observaciones?: string;

}
