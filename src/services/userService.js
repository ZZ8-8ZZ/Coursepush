import { UserModel } from '../models/userModel.js';
import { validateUserUpdate, validateUserStatusUpdate } from './validation.js';
import { NotFoundError } from './errors.js';

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }
  const { passwordHash, ...rest } = user;
  return rest;
};

export class UserService {
  static async listUsers(params) {
    const search = params.query?.trim() || undefined;
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(params.pageSize) || 20));

    const users = await UserModel.findAll({ query: search, page, pageSize });
    const total = await UserModel.countAll({ query: search });

    return {
      data: users.map(sanitizeUser),
      meta: {
        total,
        page,
        pageSize,
      }
    };
  }

  static async getUserDetail(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return sanitizeUser(user);
  }

  static async updateUser(userId, payload) {
    const data = validateUserUpdate(payload);
    const existing = await UserModel.findById(userId);
    if (!existing) {
      throw new NotFoundError('用户不存在');
    }
    const updated = await UserModel.updateUser(userId, data);
    return sanitizeUser(updated);
  }

  static async deleteUser(userId) {
    const existing = await UserModel.findById(userId);
    if (!existing) {
      throw new NotFoundError('用户不存在');
    }
    await UserModel.deleteUser(userId);
  }

  static async updateUserStatus(userId, payload) {
    const data = validateUserStatusUpdate(payload);
    const existing = await UserModel.findById(userId);
    if (!existing) {
      throw new NotFoundError('用户不存在');
    }
    const updated = await UserModel.updateUser(userId, { isActive: data.isActive });
    return sanitizeUser(updated);
  }
}
