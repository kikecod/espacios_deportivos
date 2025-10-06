import { Entity, Column, PrimaryGeneratedColumn, OneToMany, DeleteDateColumn, Unique, Index } from 'typeorm';
import { IsEnum } from 'class-validator';
import { UsuarioRol } from 'src/usuario_rol/entities/usuario_rol.entity';

export enum TipoRol {
  ADMIN = 'ADMIN',
  DUENIO = 'DUENIO',
  CONTROLADOR = 'CONTROLADOR',
  CLIENTE = 'CLIENTE',
}

@Entity('rol')
@Unique(['rol'])
export class Rol {
  @PrimaryGeneratedColumn()
  idRol: number;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.rol)
  usuarioRoles: UsuarioRol[];

  @Index()
  @Column({
    type: 'enum',
    enum: TipoRol,
    default: TipoRol.CLIENTE,
  })
  @IsEnum(TipoRol)
  rol: TipoRol;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;

  @DeleteDateColumn()
  eliminadoEn: Date | null;
}
