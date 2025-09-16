import { Column, DeleteDateColumn, Entity } from "typeorm";

@Entity()
export class Sede {

    @Column({ primary: true, generated: true })
    idSede: number;

    @Column({ type: 'int', nullable: false })
    idPersonaD: number;

    @Column({ length: 100, nullable: false })
    nombre: string;

    @Column({ length: 100, nullable: false })
    descripcion: string;

    @Column({ length: 100, nullable: false })
    direccion: string;

    @Column({ length: 100, nullable: false })
    latitud: string;

    @Column({ length: 100, nullable: false })
    longitud: string;

    @Column({ length: 100, nullable: false })
    telefono: string;

    @Column({ length: 100, nullable: false })
    email: string;

    @Column({ length: 100, nullable: false })
    politicas: string;

    @Column({ length: 100, nullable: false })
    estado: string;

    @Column({ length: 100, nullable: false })
    NIT: string;

    @Column({ length: 100, nullable: false })
    LicenciaFuncionamiento: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    actualizadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;
}
