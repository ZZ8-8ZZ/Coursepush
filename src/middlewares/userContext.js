import { AuthService } from '../services/authService.js';
import { AuthenticationError, AuthorizationError } from '../services/errors.js';
import { UserModel } from '../models/userModel.js';

const extractBearerToken = (req) => {
  const header = req.header('Authorization');
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return req.query.token || null;
};

export const requireUser = (req, _res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    throw new AuthenticationError('需要在 Authorization 请求头中提供 Bearer 令牌');
  }
  const { userId } = AuthService.verifyToken(token);
  req.userId = userId;
  next();
};

export const requireApiKey = async (req, _res, next) => {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;
  if (!apiKey) {
    throw new AuthenticationError('需要在 X-API-Key 请求头或 apiKey 参数中提供 API Key');
  }

  const user = await UserModel.findByApiKey(apiKey);
  if (!user) {
    throw new AuthenticationError('无效的 API Key');
  }

  if (!user.isActive) {
    throw new AuthorizationError('该账户已被禁用');
  }

  req.userId = user.id;
  req.user = user;
  next();
};

export const requireActiveUser = async (req, _res, next) => {
  const user = await UserModel.findById(req.userId);
  if (!user || !user.isActive) {
    throw new AuthorizationError('该账户已被禁用');
  }
  next();
};

export const requireAdmin = async (req, _res, next) => {
  const user = await UserModel.findById(req.userId);
  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('权限不足，仅管理员可访问');
  }
  if (!user.isActive) {
    throw new AuthorizationError('该账户已被禁用');
  }
  next();
};
