import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { IsEmail, IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Persona } from '../personas/entities/personas.entity';
import { Rol } from 'src/roles/rol.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BLOQUEADO = 'BLOQUEADO',
  PENDIENTE = 'PENDIENTE'
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  idUsuario: number;

  @Column({ type: 'int' })
  idPersona: number;

  @OneToOne(() => Persona, { eager: true })
  @JoinColumn({ name: 'idPersona' })
  persona: Persona;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  correo: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  correoVerificado: boolean;

  @Column({ type: 'varchar', length: 255, select: false }) // No seleccionar por defecto
  @IsString()
  hashContrasena: string;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.PENDIENTE
  })
  @IsEnum(EstadoUsuario)
  estado: EstadoUsuario;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  ultimoAccesoEn?: Date;

  // Relación con roles
  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  roles: UsuarioRol[];
  
}