import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@Entity('usuario_preferencias')
export class UsuarioPreferencias {
  @PrimaryGeneratedColumn()
  idPreferencias: number;

  @Column({ type: 'int', unique: true })
  idUsuario: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  mostrarEmail: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  mostrarTelefono: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  perfilPublico: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  notificarReservas: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  notificarPromociones: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  notificarRecordatorios: boolean;

  @Column({ type: 'varchar', length: 10, default: 'es' })
  @IsString()
  idioma: string;

  @Column({ type: 'varchar', length: 60, default: 'America/La_Paz' })
  @IsString()
  zonaHoraria: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  modoOscuro: boolean;

  @Column({ type: 'varchar', length: 120, nullable: true })
  @IsOptional()
  @IsString()
  firmaReserva?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
