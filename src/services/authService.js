import crypto from 'node:crypto';
import { UserModel } from '../models/userModel.js';
import { validateLogin, validateRegisterUser, validateUpdateProfile } from './validation.js';
import { AuthenticationError, AuthorizationError, ConflictError, NotFoundError } from './errors.js';

const hashPassword = (value) => crypto.createHash('sha256').update(value).digest('hex');
const formatAsMySqlDateTime = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date value');
  }
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }
  const { passwordHash, ...rest } = user;
  return rest;
};

export class AuthService {
  static async register(payload) {
    const data = validateRegisterUser(payload);
    const existingUser = await UserModel.findByUsername(data.username);
    if (existingUser) {
      throw new ConflictError('该用户名已被注册');
    }
    const passwordHash = hashPassword(data.password);
    const user = await UserModel.createUser({
      username: data.username,
      displayName: data.displayName,
      passwordHash,
    });
    return sanitizeUser(await UserModel.findById(user.id));
  }

  static async login(payload) {
    const data = validateLogin(payload);
    const user = await UserModel.findByUsername(data.username);
    if (!user) {
      throw new AuthenticationError('用户名或密码错误');
    }
    const passwordHash = hashPassword(data.password);
    if (user.passwordHash !== passwordHash) {
      throw new AuthenticationError('用户名或密码错误');
    }
    if (!user.isActive) {
      throw new AuthorizationError('该账户已被封禁');
    }
    await UserModel.updateUser(user.id, { lastLoginAt: formatAsMySqlDateTime(new Date()) });
    return sanitizeUser(await UserModel.findById(user.id));
  }

  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return sanitizeUser(user);
  }

  static async updateProfile(userId, payload) {
    const data = validateUpdateProfile(payload);
    const existing = await UserModel.findById(userId);
    if (!existing) {
      throw new NotFoundError('用户不存在');
    }
    await UserModel.updateUser(userId, { displayName: data.displayName });
    return sanitizeUser(await UserModel.findById(userId));
  }
}
