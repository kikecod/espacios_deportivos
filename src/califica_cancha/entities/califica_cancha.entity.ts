import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/cliente/entities/cliente.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity()
export class CalificaCancha {

    @PrimaryColumn()
    idCliente: number;

    @PrimaryColumn()
    idCancha: number;

    @PrimaryColumn()
    idSede: number;

    @ManyToOne(() => Cliente, cliente => cliente.calificaciones, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCliente'})
    cliente: Cliente;

    @ManyToOne(() => Cancha, cancha => cancha.calificaciones, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCancha'})
    cancha: Cancha;

    @ManyToOne(() => Sede, sede => sede.calificaciones, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idSede'})
    sede: Sede;

    @Column()
    puntaje: number;

    @Column({ nullable: false })
    dimensiones: string;

    @Column({ nullable: false })
    comentario: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadaEn: Date;

}
