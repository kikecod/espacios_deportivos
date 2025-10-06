import { Rol } from 'src/roles/entities/rol.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('usuarios_roles')
export class UsuarioRol {
  @PrimaryColumn()
  idUsuario: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @PrimaryColumn()
  idRol: number;

  @ManyToOne(() => Rol, (rol) => rol.usuarioRoles, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idRol' })
  rol: Rol;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  asignadoEn: Date;

  @Column({ type: 'timestamp', nullable: true })
  revocadoEn: Date | null;

  @DeleteDateColumn()
  eliminadoEn: Date | null;
}
