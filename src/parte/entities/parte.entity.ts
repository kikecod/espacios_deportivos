import { Cancha } from "src/cancha/entities/cancha.entity";
import { Disciplina } from "src/disciplina/entities/disciplina.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('parte')
export class Parte {
    @PrimaryColumn()
    idDisciplina: number;

    @ManyToOne(() => Disciplina, (disciplina) => disciplina.parte, { eager: true })
    @JoinColumn({ name: 'idDisciplina' })
    disciplina: Disciplina;

    @PrimaryColumn()
    idCancha: number;

    @ManyToOne(() => Cancha, (cancha) => cancha.parte)
    @JoinColumn({ name: 'idCancha' })
    cancha: Cancha;

    @DeleteDateColumn()
    eliminadoEn: Date;

}
