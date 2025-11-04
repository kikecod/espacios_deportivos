import { Cancha } from "src/cancha/entities/cancha.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Reserva } from "src/reservas/entities/reserva.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity('califica_cancha')
export class CalificaCancha {

    // ============================================
    // CLAVE PRIMARIA: idCliente + idCancha
    // Un cliente solo puede reseñar una cancha UNA VEZ
    // ============================================
    @PrimaryColumn()
    idCliente: number;

    @PrimaryColumn()
    idCancha: number;

    // ============================================
    // RELACIÓN CON RESERVA (para validación de 14 días)
    // ============================================
    @Column({ nullable: false })
    idReserva: number;

    @ManyToOne(() => Reserva, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idReserva' })
    reserva: Reserva;

    // ============================================
    // RELACIONES PRINCIPALES
    // ============================================
    @ManyToOne(() => Cliente, cliente => cliente.calificaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCliente' })
    cliente: Cliente;

    @ManyToOne(() => Cancha, cancha => cancha.calificaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCancha' })
    cancha: Cancha;

    // ============================================
    // CAMPOS DE LA RESEÑA
    // ============================================
    @Column({ type: 'int', nullable: false })
    puntaje: number;  // 1-5 estrellas

    @Column({ type: 'text', nullable: true })
    comentario: string;  // Opcional

    // ============================================
    // CAMPOS DE CONTROL
    // ============================================
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadaEn: Date;

    @Column({ type: 'timestamp', nullable: true })
    editadaEn: Date;

    @Column({ 
        type: 'enum', 
        enum: ['ACTIVA', 'ELIMINADA'], 
        default: 'ACTIVA' 
    })
    estado: string;

}
