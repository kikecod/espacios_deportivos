import { CalificaCancha } from "src/califica_cancha/entities/califica_cancha.entity";
import { Cancha } from "src/cancha/entities/cancha.entity";
import { Denuncia } from "src/denuncia/entities/denuncia.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Duenio } from "src/duenio/entities/duenio.entity";
import { Foto } from "src/fotos/entities/foto.entity";
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

  @Column({ length: 500, nullable: true })
  descripcion: string;

  // ============================================
  // UBICACIÓN GEOGRÁFICA (Universal)
  // ============================================
  @Column({ length: 100, nullable: true, default: 'Bolivia' })
  country: string;

  @Column({ length: 10, nullable: true })
  countryCode: string;

  @Column({ length: 100, nullable: true })
  stateProvince: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 200, nullable: true })
  addressLine: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 7, nullable: true })
  longitude: number;

  @Column({ length: 100, nullable: true })
  timezone: string;

  // Campo legacy - mantener por compatibilidad temporal
  @Column({ length: 100, nullable: true })
  direccion: string;

  @Column({ length: 100, nullable: true })
  latitud: string;

  @Column({ length: 100, nullable: true })
  longitud: string;

  @Column({ length: 100, nullable: false })
  telefono: string;

  @Column({ length: 100, nullable: false })
  email: string;

  @Column({ length: 500, nullable: true })
  politicas: string;

  @Column({ length: 100, nullable: false })
  estado: string;

  @Column({ type: 'boolean', default: false })
  verificada: boolean;

  // ----- INICIO DE SECCIÓN FUSIONADA -----

  // Este campo fue agregado por la rama 'dev'
  @Column({ type: 'boolean', default: false })
  inactivo: boolean;

  // El conflicto estaba en el decorador de 'NIT'.
  // Se eligió 'nullable: true' de la rama 'VERIFICACION'
  // para ser consistente con 'LicenciaFuncionamiento'
  @Column({ length: 100, nullable: true })
  NIT: string;

  // ----- FIN DE SECCIÓN FUSIONADA -----

  @Column({ length: 255, nullable: true })
  LicenciaFuncionamiento: string;

  // ============================================
  // RATING Y RESEÑAS (Sistema Híbrido)
  // ============================================
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingPromedioSede: number;

  @Column({ type: 'int', default: 0 })
  totalResenasSede: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingFinal: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;

  // ============================================
  // RELACIONES
  // ============================================
  @OneToMany(() => Cancha, cancha => cancha.sede, { eager: true })
  canchas: Cancha[];

  @OneToMany(() => Denuncia, denuncia => denuncia.sede)
  denuncias: Denuncia[];

  @OneToMany(() => Foto, foto => foto.sede)
  fotos: Foto[];
}