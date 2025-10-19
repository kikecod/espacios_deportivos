import { Rol } from "src/roles/rol.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("usuarios_rol")
export class UsuarioRol {

    @PrimaryColumn()
    id_usuario: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.roles)
    @JoinColumn({ name: 'id_usuario' })
    usuario: Usuario;

    @PrimaryColumn()
    id_rol: number;

    @ManyToOne(() => Rol, (rol) => rol.usuarioRoles)
    @JoinColumn({ name: 'id_rol' })
    rol: Rol;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    asignado_en: Date;

    @Column({ type: 'timestamp', nullable: true })
    revocadoEn: Date | null;;

    @DeleteDateColumn()
    eliminado_en: Date;
}
