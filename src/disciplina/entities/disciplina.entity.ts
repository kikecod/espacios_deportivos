import { Parte } from 'src/parte/entities/parte.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Disciplina {
  @PrimaryGeneratedColumn()
  id_disciplina: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({ length: 100, nullable: false })
  categoria: string;

  @Column({ length: 100, nullable: false })
  descripcion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creado_en: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date;

  @OneToMany(() => Parte, (parte) => parte.disciplina)
  parte: Parte[];
}
