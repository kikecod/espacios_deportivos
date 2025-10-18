import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn, OneToOne } from 'typeorm';
import { IsEmail, IsOptional, IsString, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Duenio } from 'src/duenio/entities/duenio.entity';

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
  id_persona: number;

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
  documento_tipo?: TipoDocumento;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString()
  documento_numero?: string;

  @Column({ type: 'varchar', length: 15 })
  @IsString()
  telefono: string;

  @Column({ type: 'boolean', default: false })
  @IsOptional()
  @IsBoolean()
  telefono_verificado?: boolean;

  @Column({ type: 'date' })
  @IsDateString()
  fecha_nacimiento: Date;

  @Column({
    type: 'enum',
    enum: Genero
  })
  @IsEnum(Genero)
  genero: Genero;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  url_foto?: string;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @DeleteDateColumn()
  eliminado_en: Date;

  @OneToOne(() => Duenio, (duenio) => duenio.persona)
  duenio: Duenio;

  @OneToMany(() => Controlador, controlador => controlador.persona)
  controlador: Controlador[];

  @OneToMany(() => Cliente, cliente => cliente.persona)
  cliente: Cliente[];
}