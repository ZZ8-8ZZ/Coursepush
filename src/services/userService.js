import { UserModel } from '../models/userModel.js';
import { validateUserUpdate, validateUserStatusUpdate, validateUniPushUpdate } from './validation.js';
import { NotFoundError, AuthorizationError } from './errors.js';
import crypto from 'crypto';

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

  static async updateUser(userId, payload, performingUserId) {
    const data = validateUserUpdate(payload);
    const existing = await UserModel.findById(userId);
    if (!existing) {
      throw new NotFoundError('用户不存在');
    }

    // 安全检查：管理员不能把自己改回普通用户，也不能把其他管理员禁用或降级
    if (existing.role === 'admin') {
      // 正在操作管理员账户
      if (userId === performingUserId) {
        // 自己改自己：不允许降级，也不允许禁用
        if (data.role === 'user') {
          throw new AuthorizationError('不能降级自己的管理员账户');
        }
        if (data.isActive === false) {
          throw new AuthorizationError('不能禁用自己的管理员账户');
        }
      } else {
        // 改别的管理员：如果试图修改角色或禁用状态，需要更高级权限（当前没做多级管理员，所以暂时全部禁止）
        if (data.role === 'user') {
          throw new AuthorizationError('不能降级其他管理员账户');
        }
        if (data.isActive === false) {
          throw new AuthorizationError('不能禁用其他管理员账户');
        }
      }
    }

    const updated = await UserModel.updateUser(userId, data);
    return sanitizeUser(updated);
  }

  static async deleteUser(userId, performingUserId) {
    const existing = await UserModel.findById(userId);
    if (!existing) {
      throw new NotFoundError('用户不存在');
    }

    // 安全检查：管理员不能删除管理员账户（包括自己）
    if (existing.role === 'admin') {
      if (userId === performingUserId) {
        throw new AuthorizationError('不能删除自己的管理员账户，请先联系其他管理员或注销');
      } else {
        throw new AuthorizationError('不能删除其他管理员账户');
      }
    }

    await UserModel.deleteUser(userId);
  }

  static async updateUserStatus(userId, payload, performingUserId) {
    const data = validateUserStatusUpdate(payload);
    const existing = await UserModel.findById(userId);
    if (!existing) {
      throw new NotFoundError('用户不存在');
    }

    // 安全检查：不能禁用管理员账户
    if (data.isActive === false && existing.role === 'admin') {
      if (userId === performingUserId) {
        throw new AuthorizationError('不能禁用自己的管理员账户');
      } else {
        throw new AuthorizationError('不能禁用其他管理员账户');
      }
    }

    const updated = await UserModel.updateUser(userId, data);
    return sanitizeUser(updated);
  }

  static async getUniPush(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return { uniPush: user.uniPush };
  }

  static async updateUniPush(userId, payload) {
    const data = validateUniPushUpdate(payload);
    const user = await UserModel.updateUser(userId, data);
    return { uniPush: user.uniPush };
  }

  static async getApiKey(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    
    // 如果用户还没有 API Key，自动生成一个
    if (!user.apiKey) {
      const newApiKey = crypto.randomBytes(32).toString('hex');
      const updatedUser = await UserModel.updateUser(userId, { apiKey: newApiKey });
      return { apiKey: updatedUser.apiKey };
    }
    
    return { apiKey: user.apiKey };
  }

  static async refreshApiKey(userId) {
    const newApiKey = crypto.randomBytes(32).toString('hex');
    const user = await UserModel.updateUser(userId, { apiKey: newApiKey });
    return { apiKey: user.apiKey };
  }
}
