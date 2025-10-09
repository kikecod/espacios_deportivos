import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity()
export class Denuncia {

    @PrimaryColumn()
    idCliente: number;

    @PrimaryColumn()
    idCancha: number;

    @ManyToOne(() => Cliente, cliente => cliente.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCliente' })
    cliente: Cliente;

    @ManyToOne(() => Cancha, cancha => cancha.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCancha' })
    cancha: Cancha;

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
