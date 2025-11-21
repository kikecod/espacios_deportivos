import { Cancha } from "src/cancha/entities/cancha.entity";
import { Sede } from "src/sede/entities/sede.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("foto")
export class Foto {

    @PrimaryGeneratedColumn()
    idFoto: number;

    // ============================================
    // DISCRIMINADOR: Tipo de foto (polimórfica)
    // ============================================
    @Column({ 
        type: 'enum', 
        enum: ['sede', 'cancha'],
        default: 'cancha'  // Valor por defecto para fotos existentes
    })
    tipo: 'sede' | 'cancha';

    // ============================================
    // RELACIÓN CON SEDE (nullable)
    // ============================================
    @Column({ nullable: true })
    idSede: number;

    @ManyToOne(() => Sede, sede => sede.fotos, { nullable: true })
    @JoinColumn({ name: 'idSede' })
    sede: Sede;

    // ============================================
    // RELACIÓN CON CANCHA (nullable)
    // ============================================
    @Column({ nullable: true })
    idCancha: number;

    @ManyToOne(() => Cancha, cancha => cancha.fotos, { nullable: true })
    @JoinColumn({ name: "idCancha" })
    cancha: Cancha;

    // ============================================
    // DATOS DE LA FOTO
    // ============================================
    @Column({ length: 500, nullable: false })
    urlFoto: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @DeleteDateColumn()
    eliminadoEn: Date;

}
