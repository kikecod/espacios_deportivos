import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  Unique,
  Index,
} from 'typeorm';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Duenio } from 'src/duenios/entities/duenio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export enum TipoDocumento {
  CC = 'CC',
  CE = 'CE',
  TI = 'TI',
  PP = 'PP',
}

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO',
}

@Entity('persona')
@Unique('UQ_persona_documento', ['documentoTipo', 'documentoNumero'])
export class Persona {
  @PrimaryGeneratedColumn()
  idPersona: number;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  paterno: string;

  @Column({ type: 'varchar', length: 100 })
  materno: string;

  @Column({
    type: 'enum',
    enum: TipoDocumento,
    nullable: true,
    default: null,
  })
  documentoTipo: TipoDocumento | null;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  documentoNumero: string | null;

  @Index('IDX_persona_telefono')
  @Column({ type: 'varchar', length: 15 })
  telefono: string;

  @Column({ type: 'boolean', default: false })
  telefonoVerificado: boolean;

  // 'date' en BD; en tu DTO valida con @IsDate o @IsDateString y transforma
  @Column({ type: 'date' })
  fechaNacimiento: Date;

  @Column({ type: 'enum', enum: Genero })
  genero: Genero;

  @Column({ type: 'text', nullable: true, default: null })
  urlFoto: string | null;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date | null;

  // Relaciones 1:1 (lado NO dueño si la FK vive en las otras tablas)
  @OneToOne(() => Duenio, (duenio) => duenio.persona, {
    cascade: false, // pon true si crearás Duenio junto a Persona
  })
  duenio: Duenio;

  @OneToOne(() => Controlador, (controlador) => controlador.persona, {
    cascade: false,
  })
  controlador: Controlador;

  @OneToOne(() => Cliente, (cliente) => cliente.persona, {
    cascade: false, // si tu Auth crea Cliente por defecto, puedes poner true
  })
  cliente: Cliente;

  @OneToOne(() => Usuario, (u) => u.persona)  // ← relación inversa
  usuario: Usuario;
}
