import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity()
export class Denuncia {

    @PrimaryColumn()
    id_cliente: number;

    @PrimaryColumn()
    id_cancha: number;

    @PrimaryColumn()
    id_sede: number;

    @ManyToOne(() => Cliente, cliente => cliente.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_cliente' })
    cliente: Cliente;
s
    @ManyToOne(() => Cancha, cancha => cancha.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_cancha' })
    cancha: Cancha;

    
    @ManyToOne(() => Sede, sede => sede.denuncias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_sede' })
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
    asignado_a: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creado_en: Date;

    @Column({ type: 'timestamp', nullable: true })
    actualizado_en: Date;

}
