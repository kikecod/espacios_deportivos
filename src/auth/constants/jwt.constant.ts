type TimeUnit = 's' | 'm' | 'h' | 'd';
type ExpiresIn = number | `${number}${TimeUnit}`;

const defaultSecret = process.env.JWT_SECRET ?? 'no utilizar esta palabra en produccion';

const parseExpiresIn = (value: string | undefined, fallback: number): ExpiresIn => {
  if (!value) {
    return fallback;
  }

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  return value as `${number}${TimeUnit}`;
};

const parseSecretList = (value: string | undefined): string[] =>
  value?.split(',').map((secret) => secret.trim()).filter(Boolean) ?? [];

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

const parseSameSite = (value: string | undefined): 'lax' | 'strict' | 'none' => {
  switch (value?.toLowerCase()) {
    case 'strict':
      return 'strict';
    case 'none':
      return 'none';
    default:
      return 'lax';
  }
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const jwtConstants = {
  accessSecret: process.env.JWT_ACCESS_SECRET ?? defaultSecret,
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? `${defaultSecret}-refresh`,
  legacyAccessSecrets: parseSecretList(process.env.JWT_LEGACY_ACCESS_SECRETS),
  legacyRefreshSecrets: parseSecretList(process.env.JWT_LEGACY_REFRESH_SECRETS),
  accessTokenExpiresIn: parseExpiresIn(process.env.JWT_ACCESS_EXPIRES_IN, 900),
  refreshTokenExpiresIn: parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN, 60 * 60 * 24 * 7),
  refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME ?? 'refresh_token',
  refreshCookiePath: process.env.JWT_REFRESH_COOKIE_PATH ?? '/api',
  refreshCookieSameSite: parseSameSite(process.env.JWT_REFRESH_COOKIE_SAMESITE),
  refreshCookieSecure: parseBoolean(process.env.JWT_REFRESH_COOKIE_SECURE, process.env.NODE_ENV === 'production'),
  refreshCookieMaxAgeMs: parseNumber(process.env.JWT_REFRESH_COOKIE_MAX_AGE_MS, 7 * 24 * 60 * 60 * 1000),
};
