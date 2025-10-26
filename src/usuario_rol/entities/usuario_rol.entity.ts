import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Rol } from 'src/roles/rol.entity';
import { Usuario } from 'src/usuarios/usuario.entity';

@Entity('usuarios_rol')
export class UsuarioRol {
  @PrimaryColumn({ name: 'id_usuario', type: 'int' })
  id_usuario: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.roles)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @PrimaryColumn({ name: 'id_rol', type: 'int' })
  id_rol: number;

  @ManyToOne(() => Rol, (rol) => rol.usuarioRoles)
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @Column({
    name: 'asignado_en',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  asignado_en: Date;

  @Column({ name: 'revocado_en', type: 'timestamp', nullable: true })
  revocado_en: Date | null;

  @DeleteDateColumn({ name: 'eliminado_en' })
  eliminado_en: Date | null;
}
