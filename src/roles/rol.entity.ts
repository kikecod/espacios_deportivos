
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, ManyToMany, OneToMany, DeleteDateColumn } from 'typeorm';
import { IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';

export enum TipoRol {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST'
}

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  idRol: number;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.rol)
  usuarioRoles: UsuarioRol[];

  @Column({
    type: 'enum',
    enum: TipoRol,
    default: TipoRol.USER
  })
  @IsEnum(TipoRol)
  rol: TipoRol;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;
}