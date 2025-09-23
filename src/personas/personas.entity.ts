import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export enum TipoDocumento {
  CC = 'CC', // Cédula de Ciudadanía
  CE = 'CE', // Cédula de Extranjería
  TI = 'TI', // Tarjeta de Identidadficacion
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
    default: TipoDocumento.CC
  })
  @IsEnum(TipoDocumento)
  documentoTipo: TipoDocumento;

  @Column({ type: 'varchar', length: 20, unique: true })
  @IsString()
  documentoNumero: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  @IsOptional()
  @IsString()
  telefono?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  telefonoVerificado: boolean;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: Date;

  @Column({
    type: 'enum',
    enum: Genero,
    nullable: true
  })
  @IsOptional()
  @IsEnum(Genero)
  genero?: Genero;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  urlFoto?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}