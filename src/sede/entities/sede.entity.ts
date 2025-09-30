import { CalificaCancha } from "src/califica_cancha/entities/califica_cancha.entity";
import { Cancha } from "src/cancha/entities/cancha.entity";
import { Denuncia } from "src/denuncia/entities/denuncia.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Duenio } from "src/duenio/entities/duenio.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Sede {

  @Column({ primary: true, generated: true })
  idSede: number;

  @Column({ type: 'int', nullable: false })
  idPersonaD: number;

  @ManyToOne(() => Duenio, (duenio) => duenio.sedes)
  @JoinColumn({ name: 'idPersonaD' })
  duenio: Duenio;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({ length: 100, nullable: false })
  descripcion: string;

  @Column({ length: 100, nullable: false })
  direccion: string;

  @Column({ length: 100, nullable: false })
  latitud: string;

  @Column({ length: 100, nullable: false })
  longitud: string;

  @Column({ length: 100, nullable: false })
  telefono: string;

  @Column({ length: 100, nullable: false })
  email: string;

  @Column({ length: 100, nullable: false })
  politicas: string;

  @Column({ length: 100, nullable: false })
  estado: string;

  @Column({ length: 100, nullable: false })
  NIT: string;

  @Column({ length: 100, nullable: false })
  LicenciaFuncionamiento: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;

  
  @OneToMany(() => Cancha, cancha => cancha.sede, { eager: true })
  canchas: Cancha[];

  @OneToMany(() => CalificaCancha, calificaCancha => calificaCancha.sede)
  calificaciones: CalificaCancha[];

  @OneToMany(() => Denuncia, denuncia => denuncia.sede)
  denuncias: Denuncia[];
}
