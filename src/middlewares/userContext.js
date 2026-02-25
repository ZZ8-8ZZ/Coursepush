import { AuthenticationError } from '../services/errors.js';

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
