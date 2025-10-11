import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/common/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly ds: DataSource, private readonly redis: RedisService) {}

  @Get()
  async get() {
    const now = Date.now();
    // DB check
    let dbOk = false;
    let dbError: string | null = null;
    try {
      await this.ds.query('SELECT 1');
      dbOk = true;
    } catch (e: any) {
      dbError = e?.message || String(e);
    }

    // Redis check
    let redisOk = false;
    let redisError: string | null = null;
    try {
      await this.redis.setLastActivity(-999, now);
      const v = await this.redis.getLastActivity(-999);
      redisOk = typeof v === 'number';
      await this.redis.clearLastActivity(-999);
    } catch (e: any) {
      redisError = e?.message || String(e);
    }

    return {
      db: { ok: dbOk, error: dbError },
      redis: { ok: redisOk, error: redisError },
      time: new Date().toISOString(),
    };
  }
}

