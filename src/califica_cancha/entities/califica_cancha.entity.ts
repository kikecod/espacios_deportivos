import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity('califica')
export class CalificaCancha {

    @PrimaryColumn()
    idCliente: number;

    @PrimaryColumn()
    idCancha: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.calificaciones, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCliente'})
    cliente: Cliente;

    @ManyToOne(() => Cancha, (cancha) => cancha.calificaciones, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'idCancha'})
    cancha: Cancha;

    @Column()
    puntaje: number;

    @Column({ nullable: false })
    dimensiones: string;

    @Column({ nullable: false })
    comentario: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadaEn: Date;

}
