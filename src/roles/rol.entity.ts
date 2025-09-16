import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { IsString, IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum TipoRol {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  GUEST = 'GUEST'
}

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  idRol: number;

  @Column({ type: 'int' })
  idUsuario: number;

  @ManyToOne('Usuario', 'roles')
  @JoinColumn({ name: 'idUsuario' })
  usuario: any; // Usar any para evitar dependencia circular

  @Column({
    type: 'enum',
    enum: TipoRol,
    default: TipoRol.USER
  })
  @IsEnum(TipoRol)
  rol: TipoRol;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  activo: boolean;

  @CreateDateColumn()
  asignadoEn: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  revocadoEn?: Date;
}