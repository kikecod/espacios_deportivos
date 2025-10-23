import { JwtService } from '@nestjs/jwt';

export async function verifyWithFallback<T extends object>(
  jwtService: JwtService,
  token: string,
  primarySecret: string,
  fallbackSecrets: string[],
): Promise<T> {
  const secrets = [primarySecret, ...fallbackSecrets.filter((secret) => secret && secret !== primarySecret)];
  let lastError: unknown;

  for (const secret of secrets) {
    try {
      return await jwtService.verifyAsync<T>(token, { secret });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Token verification failed');
}
