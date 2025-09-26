import { Cancha } from "src/cancha/entities/cancha.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("foto")
export class Foto {

    @PrimaryGeneratedColumn()
    idFoto: number;

    @Column()
    idCancha: number;

    @ManyToOne(() => Cancha, (cancha) => cancha.fotos)
    @JoinColumn({ name: "idCancha" })
    cancha: Cancha;

    @Column({length: 100, nullable: false })
    urlFoto: string;

}
