import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Persona } from '../personas/entities/personas.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BLOQUEADO = 'BLOQUEADO',
  PENDIENTE = 'PENDIENTE',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ name: 'id_persona', type: 'int' })
  id_persona: number;

  @OneToOne(() => Persona, { eager: true })
  @JoinColumn({ name: 'id_persona' })
  persona: Persona;

  @Column({ name: 'usuario', type: 'varchar', length: 50, unique: true })
  @IsString()
  usuario: string;

  @Column({ name: 'correo', type: 'varchar', length: 255, unique: true })
  @IsEmail()
  correo: string;

  @Column({ name: 'correo_verificado', type: 'boolean', default: false })
  @IsBoolean()
  correo_verificado: boolean;

  @Column({ name: 'hash_contrasena', type: 'varchar', length: 255, select: false })
  @IsString()
  hash_contrasena: string;

  @Column({ name: 'hash_refresh_token', type: 'varchar', length: 512, nullable: true, select: false })
  @IsOptional()
  hash_refresh_token?: string | null;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.PENDIENTE,
  })
  @IsEnum(EstadoUsuario)
  estado: EstadoUsuario;

  @CreateDateColumn({ name: 'creado_en' })
  creado_en: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizado_en: Date;

  @Column({ name: 'ultimo_acceso_en', type: 'timestamp', nullable: true })
  @IsOptional()
  ultimo_acceso_en?: Date;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  roles: UsuarioRol[];
}
