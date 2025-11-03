import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { IsBoolean, IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

@Entity('usuario_email_verificacion')
export class UsuarioEmailVerificacion {
  @PrimaryGeneratedColumn()
  idVerificacion: number;

  @Column({ type: 'int' })
  idUsuario: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail()
  nuevoCorreo: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsString()
  token: string;

  @Column({ type: 'timestamp' })
  @IsDate()
  expiraEn: Date;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  utilizado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  confirmadoEn?: Date;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}
