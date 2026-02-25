import { AuthService } from '../services/authService.js';
import { sendSuccess } from '../utils/httpResponses.js';

export class UserController {
  static async getProfile(req, res) {
    const profile = await AuthService.getProfile(req.userId);
    return sendSuccess(res, profile);
  }

  static async updateProfile(req, res) {
    const profile = await AuthService.updateProfile(req.userId, req.body);
    return sendSuccess(res, profile);
  }
}
