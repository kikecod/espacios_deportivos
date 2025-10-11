import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });
    // Evitar fallar en tests o dev si Redis no está disponible
    this.client.on('error', () => {});
    this.client.connect().catch(() => {});
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      // ignore
    }
  }

  private lastActivityKey(userId: number) {
    return `sess:lastActivity:${userId}`;
  }

  async getLastActivity(userId: number): Promise<number | null> {
    const val = await this.client.get(this.lastActivityKey(userId));
    if (!val) return null;
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  }

  async setLastActivity(userId: number, when: number = Date.now()): Promise<void> {
    const ttlSec = parseInt(process.env.INACTIVITY_MINUTES || '15', 10) * 60;
    await this.client.set(this.lastActivityKey(userId), String(when), 'EX', ttlSec * 2);
  }

  async clearLastActivity(userId: number): Promise<void> {
    await this.client.del(this.lastActivityKey(userId));
  }
}

