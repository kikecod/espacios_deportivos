import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn, OneToOne } from 'typeorm';
import { IsOptional, IsString, IsBoolean, IsDateString, IsEnum, IsArray } from 'class-validator';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Duenio } from 'src/duenio/entities/duenio.entity';
import { Usuario } from 'src/usuarios/usuario.entity';

export enum TipoDocumento {
  CC = 'CC', // Cédula de Ciudadanía
  CE = 'CE', // Cédula de Extranjería
  TI = 'TI', // Tarjeta de Identidadficaciond
  PP = 'PP'  // Pasaporte
}

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO'
}

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn()
  idPersona: number;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  paterno: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  materno: string;

  @Column({
    type: 'enum',
    enum: TipoDocumento,
    default: TipoDocumento.CC,
    nullable: true
  })
  @IsOptional()
  @IsEnum(TipoDocumento)
  documentoTipo?: TipoDocumento;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  documentoNumero?: string;

  @Column({ type: 'varchar', length: 15 })
  @IsString()
  telefono: string;

  @Column({ type: 'boolean', default: false })
  @IsOptional()
  @IsBoolean()
  telefonoVerificado?: boolean;

  @Column({ type: 'date' })
  @IsDateString()
  fechaNacimiento: Date;

  @Column({
    type: 'enum',
    enum: Genero
  })
  @IsEnum(Genero)
  genero: Genero;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  urlFoto?: string | null;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  @IsOptional()
  @IsString()
  direccion?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  ciudad?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  pais?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  @IsOptional()
  @IsString()
  ocupacion?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deportesFavoritos?: string[] | null;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;

  @OneToOne(() => Duenio, (duenio) => duenio.persona)
  duenio: Duenio;

  @OneToMany(() => Controlador, controlador => controlador.persona)
  controlador: Controlador[];

  @OneToMany(() => Cliente, cliente => cliente.persona)
  cliente: Cliente[];

  @OneToOne(() => Usuario, (usuario) => usuario.persona)
  usuario: Usuario;
}
