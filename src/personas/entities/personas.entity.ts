import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn, OneToOne } from 'typeorm';
import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Duenio } from 'src/duenios/entities/duenio.entity';

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

@Entity('persona')
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
  urlFoto?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;

  @OneToOne(
    () => Duenio, 
    (duenio) => duenio.persona,
    { cascade: true }
  )
  duenio: Duenio;

  @OneToOne(
    () => Controlador, 
    (controlador) => controlador.persona,
    { cascade: true }    
  )
  controlador: Controlador;

  @OneToOne(
    () => Cliente, 
    (cliente) => cliente.persona,
    { cascade: true }
  )
  cliente: Cliente;
}