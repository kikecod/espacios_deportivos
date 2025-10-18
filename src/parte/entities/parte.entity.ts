import { Cancha } from "src/cancha/entities/cancha.entity";
import { Disciplina } from "src/disciplina/entities/disciplina.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Parte {
    @PrimaryColumn()
    id_disciplina: number;

    @ManyToOne(() => Disciplina, (disciplina) => disciplina.parte, { eager: true })
    @JoinColumn({ name: 'id_disciplina' })
    disciplina: Disciplina;

    @PrimaryColumn()
    id_cancha: number;

    @ManyToOne(() => Cancha, (cancha) => cancha.parte)
    @JoinColumn({ name: 'id_cancha' })
    cancha: Cancha;

    @DeleteDateColumn()
    eliminado_en: Date;

}
