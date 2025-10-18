
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { IsEnum } from 'class-validator';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';

export enum TipoRol {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
  DUENIO = 'DUENIO',
  CONTROLADOR = 'CONTROLADOR'
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
    default: TipoRol.CLIENTE
  })
  @IsEnum(TipoRol)
  rol: TipoRol;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date;
}