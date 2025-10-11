// src/auth/constants/jwt.constant.ts
export const jwtConstants = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  accessTtl: process.env.JWT_ACCESS_TTL || '15m',
};
