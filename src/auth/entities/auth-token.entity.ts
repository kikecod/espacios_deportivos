import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';

export enum AuthTokenType {
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

@Entity('auth_tokens')
@Index('idx_auth_tokens_token_hash', ['tokenHash'], { unique: true })
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  usuario: Usuario;

  @Column({ type: 'enum', enum: AuthTokenType })
  type: AuthTokenType;

  @Column({ name: 'token_hash', type: 'varchar', length: 128, unique: true })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt?: Date | null;

  @Column({ name: 'request_ip', type: 'varchar', length: 64, nullable: true })
  requestIp?: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
