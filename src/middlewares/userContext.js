import { AuthenticationError, AuthorizationError } from '../services/errors.js';
import { UserModel } from '../models/userModel.js';

const parseUserId = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const requireUser = (req, _res, next) => {
  const headerValue = req.header('X-User-Id');
  const userId = parseUserId(headerValue);
  if (!userId) {
    throw new AuthenticationError('需要在 X-User-Id 请求头中提供合法的用户 ID');
  }
  req.userId = userId;
  next();
};

export const requireAdmin = async (req, _res, next) => {
  const user = await UserModel.findById(req.userId);
  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('权限不足，仅管理员可访问');
  }
  next();
};
