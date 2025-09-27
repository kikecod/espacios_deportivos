import { CalificaCancha } from "src/califica_cancha/entities/califica_cancha.entity";
import { Denuncia } from "src/denuncia/entities/denuncia.entity";
import { PersonasController } from "src/personas/personas.controller";
import { Persona } from "src/personas/entities/personas.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";


@Entity()
export class Cliente {

    @PrimaryColumn()
    idCliente: number;

    @ManyToOne(() => Persona, persona => persona.cliente, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCliente'})
    persona: Persona;

    @Column({ length: 100, nullable: false })
    apodo: string;

    @Column({ type: 'int', nullable: false })
    nivel: number;

    @Column({ length: 500, nullable: true })
    observaciones: string;

    //Relación con Reserva (un cliente puede tener muchas reservas)
    @OneToMany(() => Reserva, reserva => reserva.cliente)
    reservas: Reserva[];

    @OneToMany(() => CalificaCancha, calificaCancha => calificaCancha.cliente)
    calificaciones: CalificaCancha[];

    @OneToMany(() => Denuncia, denuncia => denuncia.cliente)
    denuncias: Denuncia[];

}
