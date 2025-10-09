import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn, OneToMany, Unique, Index, BeforeInsert, BeforeUpdate,
} from 'typeorm';
import { Persona } from 'src/personas/entities/personas.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BLOQUEADO = 'BLOQUEADO',
  PENDIENTE = 'PENDIENTE',
}

@Entity('usuarios')
@Unique('UQ_usuarios_usuario', ['usuario'])
@Unique('UQ_usuarios_correo', ['correo'])
@Unique('UQ_usuarios_idPersona', ['idPersona'])
export class Usuario {
  @PrimaryGeneratedColumn()
  idUsuario: number;

  @Column({ type: 'int' })
  idPersona: number;

  @OneToOne(() => Persona, (p) => p.usuario, { eager: true })
  @JoinColumn({ name: 'idPersona', referencedColumnName: 'idPersona' }) 
  persona: Persona;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('IDX_usuarios_usuario')
  usuario: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('IDX_usuarios_correo')
  correo: string;

  @Column({ type: 'boolean', default: false })
  correoVerificado: boolean;

  // select:false => hay que pedirla explícitamente en queries
  @Column({ type: 'varchar', length: 255, select: false })
  hashContrasena: string;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    default: EstadoUsuario.PENDIENTE,
  })
  estado: EstadoUsuario;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimoAccesoEn?: Date;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  // Relación con roles
  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles: UsuarioRol[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeFields() {
    if (this.correo) this.correo = this.correo.trim().toLowerCase();
    if (this.usuario) this.usuario = this.usuario.trim();
  }
}
