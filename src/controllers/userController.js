import { AuthService } from '../services/authService.js';
import { UserService } from '../services/userService.js';
import { sendNoContent, sendSuccess } from '../utils/httpResponses.js';
import { requirePositiveId } from '../utils/controllerUtils.js';

export class UserController {
  static async getProfile(req, res) {
    const profile = await AuthService.getProfile(req.userId);
    return sendSuccess(res, profile);
  }

  static async updateProfile(req, res) {
    const profile = await AuthService.updateProfile(req.userId, req.body);
    return sendSuccess(res, profile);
  }

  static async deleteSelf(req, res) {
    await UserService.deleteUser(req.userId);
    return sendNoContent(res);
  }

  static async listUsers(req, res) {
    const result = await UserService.listUsers(req.query);
    return sendSuccess(res, result.data, { meta: result.meta });
  }

  static async getUserDetail(req, res) {
    const userId = requirePositiveId(req.params.id, '用户 ID');
    const user = await UserService.getUserDetail(userId);
    return sendSuccess(res, user);
  }

  static async updateUser(req, res) {
    const userId = requirePositiveId(req.params.id, '用户 ID');
    const user = await UserService.updateUser(userId, req.body);
    return sendSuccess(res, user);
  }

  static async deleteUser(req, res) {
    const userId = requirePositiveId(req.params.id, '用户 ID');
    await UserService.deleteUser(userId);
    return sendNoContent(res);
  }

  static async updateUserStatus(req, res) {
    const userId = requirePositiveId(req.params.id, '用户 ID');
    const user = await UserService.updateUserStatus(userId, req.body);
    return sendSuccess(res, user);
  }
}
