import { Cancha } from "src/cancha/entities/cancha.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("foto")
export class Foto {

    @PrimaryGeneratedColumn()
    id_foto: number;

    @Column()
    id_cancha: number;

    @ManyToOne(() => Cancha, (cancha) => cancha.fotos)
    @JoinColumn({ name: 'id_cancha' })
    cancha: Cancha;

    @Column({length: 100, nullable: false })
    url_foto: string;

}
