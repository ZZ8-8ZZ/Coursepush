import crypto from 'node:crypto';
import { UserModel } from '../models/userModel.js';
import { PasswordResetModel } from '../models/passwordResetModel.js';
import { EmailService } from './emailService.js';
import { validateLogin, validateRegisterUser, validateUpdateProfile } from './validation.js';
import { AuthenticationError, AuthorizationError, ConflictError, NotFoundError, ValidationError } from './errors.js';

const hashPassword = (value) => crypto.createHash('sha256').update(value).digest('hex');
const generateVerifyCode = () => Math.floor(100000 + Math.random() * 900000).toString();

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
      email: data.email,
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

    if (data.email && data.email !== existing.email) {
      const emailTaken = await UserModel.findByEmail(data.email);
      if (emailTaken) {
        throw new ConflictError('该邮箱已被其他账号绑定');
      }
    }

    await UserModel.updateUser(userId, data);
    return sanitizeUser(await UserModel.findById(userId));
  }

  static async requestPasswordReset({ email, ip }) {
    if (!email) {
      throw new ValidationError('邮箱不能为空');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await UserModel.findByEmail(trimmedEmail);
    if (!user) {
      // 为了安全，即使邮箱不存在也返回成功提示，但不发送邮件
      return { success: true, message: '如果邮箱存在，验证码已发送' };
    }

    const code = generateVerifyCode();
    const expireAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟过期
    const formattedExpireAt = formatAsMySqlDateTime(expireAt);

    await PasswordResetModel.createCode({
      userId: user.id,
      email: user.email,
      code,
      expireAt: formattedExpireAt,
      ip,
    });

    await EmailService.sendVerificationCode(user.email, code);

    return { success: true, message: '验证码已发送至您的邮箱' };
  }

  static async resetPassword({ email, code, newPassword }) {
    if (!email || !code || !newPassword) {
      throw new ValidationError('参数不完整');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    const validCode = await PasswordResetModel.findValidCode(trimmedEmail, trimmedCode);
    if (!validCode) {
      throw new ValidationError('验证码无效或已过期');
    }

    const user = await UserModel.findByEmail(trimmedEmail);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const passwordHash = hashPassword(newPassword);
    await UserModel.updatePassword(user.id, passwordHash);
    await PasswordResetModel.markAsUsed(validCode.id);

    return { success: true, message: '密码重置成功' };
  }
}
