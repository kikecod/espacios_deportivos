// src/auth/constants/jwt.constant.ts
export const jwtConstants = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  accessTtl: '15m',     // ajusta a tu gusto
  refreshTtl: '7d',
};
