import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { appConfig } from '../config/env.js';
import { UserModel } from '../models/userModel.js';
import { PasswordResetModel } from '../models/passwordResetModel.js';
import { EmailService } from './emailService.js';
import { validateLogin, validateRegisterUser, validateUpdateProfile, validateChangePassword } from './validation.js';
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
  static signToken(user) {
    const payload = { sub: user.id, role: user.role };
    return jwt.sign(payload, appConfig.jwt.secret, { expiresIn: appConfig.jwt.expiresIn });
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, appConfig.jwt.secret);
      return { userId: decoded.sub, role: decoded.role };
    } catch {
      throw new AuthenticationError('令牌无效或已过期');
    }
  }

  static async register(payload) {
    const data = validateRegisterUser(payload);
    const existingUser = await UserModel.findByUsername(data.username);
    if (existingUser) {
      throw new ConflictError('该用户名已被注册');
    }
    const passwordHash = hashPassword(data.password);
    const apiKey = crypto.randomBytes(32).toString('hex');
    const user = await UserModel.createUser({
      username: data.username,
      displayName: data.displayName,
      email: data.email,
      passwordHash,
      apiKey,
    });
    const fullUser = sanitizeUser(await UserModel.findById(user.id));
    const token = AuthService.signToken(fullUser);
    return { user: fullUser, token };
  }

  static async login(payload) {
    const data = validateLogin(payload);
    const user = await UserModel.findByIdentifier(data.username);
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
    const fullUser = sanitizeUser(await UserModel.findById(user.id));
    const token = AuthService.signToken(fullUser);
    return { user: fullUser, token };
  }

  static getSSOAuthorizeUrl(state = 'random_state') {
    const { authorizeUrl, clientId, redirectUri } = appConfig.sso;
    const url = new URL(authorizeUrl);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', 'openid profile email');
    url.searchParams.append('state', state);
    return url.toString();
  }

  static buildSSOState(redirect) {
    const payload = { redirect: redirect || null, ts: Date.now() };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  static resolveRedirectUrl(state) {
    const { frontendUrl, frontendUrls } = appConfig.sso;

    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
        if (decoded.redirect && frontendUrls.some((u) => decoded.redirect.startsWith(u))) {
          return decoded.redirect;
        }
      } catch {}
    }

    return frontendUrl;
  }

  static async handleSSOCallback(code) {
    const { tokenUrl, userInfoUrl, clientId, clientSecret, redirectUri } = appConfig.sso;

    // 1. 交换令牌
    const tokenRes = await axios.post(tokenUrl, {
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const { access_token } = tokenRes.data;

    // 2. 获取用户信息
    const userRes = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const ssoUser = userRes.data;
    // ssoUser 结构通常包含: id/sub, username, email, displayName 等

    // 3. 同步用户信息到本地数据库
    // 优先使用 email 匹配，如果没有则使用 username
    let user = await UserModel.findByIdentifier(ssoUser.email || ssoUser.username);

    if (!user) {
      // 如果不存在则创建新用户
      const apiKey = crypto.randomBytes(32).toString('hex');
      user = await UserModel.createUser({
        username: ssoUser.username || ssoUser.email.split('@')[0],
        displayName: ssoUser.displayName || ssoUser.username,
        email: ssoUser.email,
        passwordHash: 'SSO_USER', // SSO 用户没有本地密码
        apiKey,
      });
      // 重新获取完整用户信息
      user = await UserModel.findById(user.id);
    }

    if (!user.isActive) {
      throw new AuthorizationError('该账户已被封禁');
    }

    // 更新最后登录时间
    await UserModel.updateUser(user.id, { lastLoginAt: formatAsMySqlDateTime(new Date()) });

    const fullUser = sanitizeUser(user);
    const token = AuthService.signToken(fullUser);
    return { user: fullUser, token };
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

    // 1. 频率限制：60秒内只能发送一次
    const recentCount = await PasswordResetModel.countRecentCodes(user.id, 60);
    if (recentCount > 0) {
      throw new ValidationError('发送过于频繁，请 1 分钟后再试');
    }

    // 2. 总量限制：每天最多 5 次
    const dailyCount = await PasswordResetModel.countDailyCodes(user.id);
    if (dailyCount >= 5) {
      throw new ValidationError('今日验证码发送次数已达上限，请明天再试');
    }

    // 3. IP 限制：防止恶意刷接口
    if (ip) {
      const ipDailyCount = await PasswordResetModel.countIpDailyCodes(ip);
      if (ipDailyCount >= 20) {
        throw new ValidationError('您的操作过于频繁，请稍后再试');
      }
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

  static async changePassword(userId, payload) {
    const data = validateChangePassword(payload);
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const oldPasswordHash = hashPassword(data.oldPassword);
    if (user.passwordHash !== oldPasswordHash) {
      throw new ValidationError('原密码不正确');
    }

    const newPasswordHash = hashPassword(data.newPassword);
    await UserModel.updatePassword(userId, newPasswordHash);

    return { success: true, message: '密码修改成功' };
  }
}
