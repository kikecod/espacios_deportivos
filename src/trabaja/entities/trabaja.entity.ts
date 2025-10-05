import { Controlador } from "src/controlador/entities/controlador.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity('trabaja')
export class Trabaja {

    @PrimaryColumn()
    idPersonaOpe: number;

    @PrimaryColumn()
    idSede: number;

    @ManyToOne(
        () => Controlador,
        (controlador) => controlador.trabaja,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'idPersonaOpe' })
    controlador: Controlador;

    @ManyToOne(
        () => Sede,
        (sede) => sede.trabaja,
        { onDelete: 'CASCADE' }
    )
    @JoinColumn({ name: 'idSede' })
    sede: Sede;
    
    
    @Column({ type: 'date', nullable: false })
    fechaInicio: Date;

    @Column({ type: 'date', nullable: false })
    fechaFin: Date;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

}
