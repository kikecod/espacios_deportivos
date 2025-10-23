import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { AuthToken, AuthTokenType } from './entities/auth-token.entity';

type CreateTokenOptions = {
  userId: number;
  type: AuthTokenType;
  ttlSeconds: number;
  requestIp?: string;
  userAgent?: string;
};

@Injectable()
export class AuthTokenService {
  constructor(
    @InjectRepository(AuthToken)
    private readonly authTokenRepository: Repository<AuthToken>,
  ) {}

  async createToken({ userId, type, ttlSeconds, requestIp, userAgent }: CreateTokenOptions) {
    const token = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const entity = this.authTokenRepository.create({
      userId,
      type,
      tokenHash,
      expiresAt,
      requestIp,
      userAgent,
    });

    await this.authTokenRepository.save(entity);

    return { token, expiresAt };
  }

  async consumeToken(token: string, type: AuthTokenType): Promise<AuthToken> {
    const tokenHash = this.hashToken(token);
    const authToken = await this.authTokenRepository.findOne({
      where: { tokenHash, type },
    });

    if (!authToken) {
      throw new UnauthorizedException('Token invalido');
    }

    if (authToken.consumedAt) {
      throw new UnauthorizedException('Token ya fue utilizado');
    }

    if (authToken.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Token expirado');
    }

    authToken.consumedAt = new Date();
    await this.authTokenRepository.save(authToken);
    return authToken;
  }

  async invalidateTokens(userId: number, type: AuthTokenType): Promise<void> {
    await this.authTokenRepository.update(
      {
        userId,
        type,
      },
      { consumedAt: new Date() },
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
