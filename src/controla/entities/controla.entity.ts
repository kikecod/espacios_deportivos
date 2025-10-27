import { Controlador } from 'src/controlador/entities/controlador.entity';
import { PasesAcceso } from 'src/pases_acceso/entities/pases_acceso.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('controla')
export class Controla {
  @PrimaryColumn({ name: 'id_controlador', type: 'int' })
  id_controlador: number;

  @PrimaryColumn({ name: 'id_pase_acceso', type: 'int' })
  id_pase_acceso: number;

  @ManyToOne(() => Controlador, (controlador) => controlador.controla, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_controlador' })
  controlador: Controlador;

  @ManyToOne(() => PasesAcceso, (paseAcceso) => paseAcceso.controles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pase_acceso' })
  paseAcceso: PasesAcceso;
}
