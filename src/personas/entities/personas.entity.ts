import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Controlador } from 'src/controlador/entities/controlador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Duenio } from 'src/duenio/entities/duenio.entity';

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

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn({ name: 'id_persona' })
  id_persona: number;

  @Column({ name: 'nombres', type: 'varchar', length: 100 })
  @IsString()
  nombres: string;

  @Column({ name: 'paterno', type: 'varchar', length: 100 })
  @IsString()
  paterno: string;

  @Column({ name: 'materno', type: 'varchar', length: 100 })
  @IsString()
  materno: string;

  @Column({
    name: 'documento_tipo',
    type: 'enum',
    enum: TipoDocumento,
    default: TipoDocumento.CC,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(TipoDocumento)
  documento_tipo?: TipoDocumento;

  @Column({
    name: 'documento_numero',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  documento_numero?: string;

  @Column({ name: 'telefono', type: 'varchar', length: 15 })
  @IsString()
  telefono: string;

  @Column({ name: 'telefono_verificado', type: 'boolean', default: false })
  @IsOptional()
  @IsBoolean()
  telefono_verificado?: boolean;

  @Column({ name: 'fecha_nacimiento', type: 'date' })
  @IsDateString()
  fecha_nacimiento: Date;

  @Column({ name: 'genero', type: 'enum', enum: Genero })
  @IsEnum(Genero)
  genero: Genero;

  @Column({ name: 'url_foto', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  url_foto?: string;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminado_en: Date | null;

  @OneToOne(() => Duenio, (duenio) => duenio.persona)
  duenio: Duenio;

  @OneToMany(() => Controlador, (controlador) => controlador.persona)
  controlador: Controlador[];

  @OneToMany(() => Cliente, (cliente) => cliente.persona)
  cliente: Cliente[];
}
