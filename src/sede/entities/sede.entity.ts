import { Cancha } from "src/cancha/entities/cancha.entity";
import { Duenio } from "src/duenios/entities/duenio.entity";
import { Trabaja } from "src/trabaja/entities/trabaja.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('sede')
export class Sede {

  @PrimaryGeneratedColumn()
  idSede: number;

  @Column({ type: 'int', nullable: false })
  idPersonaD: number;

  @ManyToOne(
    () => Duenio, 
    (duenio) => duenio.sedes
  )
  @JoinColumn({ name: 'idPersonaD' })
  duenio: Duenio[];

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({ length: 100, nullable: false })
  descripcion: string;

  @Column({ length: 100, nullable: false })
  direccion: string;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  latitud: number;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  longitud: number;

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

  @OneToMany(
    () => Trabaja,
    (trabaja) => trabaja.sede,
    { cascade: true }
  )
  trabaja: Trabaja[];
  
  @OneToMany(
    () => Cancha, 
    (cancha) => cancha.sede,
  )
  canchas: Cancha[];

}
