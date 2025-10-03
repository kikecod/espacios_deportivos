import { Rol } from "src/roles/rol.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("usuarios_roles")
export class UsuarioRol {

    @PrimaryColumn()
    idUsuario: number;

    @ManyToOne(() => Usuario, (usuario) => usuario.roles)
    @JoinColumn({ name: 'idUsuario'})
    usuario: Usuario;

    @PrimaryColumn()
    idRol: number;

    @ManyToOne(() => Rol, (rol) => rol.usuarioRoles)
    @JoinColumn({ name: 'idRol'})
    rol: Rol;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    asignadoEn: Date;

    @Column({ type: 'timestamp', nullable: true })
    revocadoEn: Date | null;;

    @DeleteDateColumn()
    eliminadoEn: Date;
}
