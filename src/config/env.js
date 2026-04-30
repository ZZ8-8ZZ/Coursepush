import 'dotenv/config';

const toInteger = (value, fallback) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no'].includes(normalized)) {
    return false;
  }
  return fallback;
};

export const appConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  enableSqlLogging: toBoolean(process.env.DB_LOG_SQL, false),
  port: toInteger(process.env.PORT ?? process.env.APP_PORT, 3200),
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  resendApiKey: process.env.RESEND_API_KEY,
  zhipuApiKey: process.env.ZHIPU_AI_API_KEY ?? '',
  zhipuModel: process.env.ZHIPU_AI_MODEL ?? 'glm-5.1',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'coursepush-jwt-secret-dev-only',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  sso: {
    clientId: process.env.SSO_CLIENT_ID,
    clientSecret: process.env.SSO_CLIENT_SECRET,
    authorizeUrl: process.env.SSO_AUTHORIZE_URL ?? 'http://localhost:3000/oauth/authorize',
    tokenUrl: process.env.SSO_TOKEN_URL ?? 'http://localhost:3000/oauth/token',
    userInfoUrl: process.env.SSO_USER_INFO_URL ?? 'http://localhost:3000/api/userinfo',
    redirectUri: process.env.SSO_REDIRECT_URI ?? 'http://localhost:3200/api/v1/auth/sso/callback',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    frontendUrls: (process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? 'http://localhost:3000')
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean),
  },
};

// 本地数据库配置
// export const databaseConfig = {
//   host: process.env.DB_HOST ?? '127.0.0.1',
//   port: toInteger(process.env.DB_PORT, 3306),
//   user: process.env.DB_USER ?? 'root',
//   password: process.env.DB_PASSWORD ?? 'admini',
//   database: process.env.DB_NAME ?? 'coursepush_admin',
//   connectionLimit: toInteger(process.env.DB_POOL_LIMIT, 10),
//   connectTimeout: toInteger(process.env.DB_CONNECT_TIMEOUT, 10000),
// };

// 生产数据库配置
export const databaseConfig = {
  host: process.env.DB_HOST ?? 'mysql7.sqlpub.com',
  port: toInteger(process.env.DB_PORT, 3312),
  user: process.env.DB_USER ?? 'registry',
  password: process.env.DB_PASSWORD ?? 'uKif7E5U0v1l2Nvb',
  database: process.env.DB_NAME ?? 'coursepush_admini',
  connectionLimit: toInteger(process.env.DB_POOL_LIMIT, 20),
  connectTimeout: toInteger(process.env.DB_CONNECT_TIMEOUT, 30000),
};

export const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];

export const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`缺少数据库连接必要环境变量: ${missing.join(', ')}`);
  }
};
