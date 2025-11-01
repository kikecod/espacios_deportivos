import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { IsOptional, IsString } from 'class-validator';

@Entity('usuario_avatar_logs')
export class UsuarioAvatarLog {
  @PrimaryGeneratedColumn()
  idAvatarLog: number;

  @Column({ type: 'int' })
  idUsuario: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  rutaAnterior?: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  rutaNueva: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  @IsOptional()
  @IsString()
  accion?: string;

  @CreateDateColumn()
  creadoEn: Date;
}
