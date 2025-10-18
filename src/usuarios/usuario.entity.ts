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
  id_usuario: number;

  @Column({ type: 'int' })
  id_persona: number;

  @OneToOne(() => Persona, { eager: true })
  @JoinColumn({ name: 'id_persona' })
  persona: Persona;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsString()
  usuario: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  correo: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  correo_verificado: boolean;

  @Column({ type: 'varchar', length: 255, select: false }) // No seleccionar por defecto
  @IsString()
  hash_contrasena: string;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.PENDIENTE
  })
  @IsEnum(EstadoUsuario)
  estado: EstadoUsuario;

  @CreateDateColumn()
  creado_en: Date;

  @UpdateDateColumn()
  actualizado_en: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  ultimoAccesoEn?: Date;

  // Relación con roles
  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  roles: UsuarioRol[];
  
}