import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/cliente/entities/cliente.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity()
export class Denuncia {

    @PrimaryColumn()
    idCliente: number;

    @PrimaryColumn()
    idCancha: number;

    @PrimaryColumn()
    idSede: number;

    @ManyToOne(() => Cliente, cliente => cliente.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCliente' })
    cliente: Cliente;

    @ManyToOne(() => Cancha, cancha => cancha.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCancha' })
    cancha: Cancha;

    @ManyToOne(() => Sede, sede => sede.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idSede' })
    sede: Sede;

    @Column()
    categoria: string;

    @Column()
    gravedad: string;

    @Column({ default: 'pendiente' })
    estado: string;

    @Column()
    titulo: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ nullable: true })
    asignadoA: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', nullable: true })
    actualizadoEn: Date;

}
