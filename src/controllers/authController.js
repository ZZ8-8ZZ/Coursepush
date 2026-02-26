import { AuthService } from '../services/authService.js';
import { sendSuccess } from '../utils/httpResponses.js';

export class AuthController {
  static async register(req, res) {
    const user = await AuthService.register(req.body);
    return sendSuccess(res, user, { statusCode: 201 });
  }

  static async login(req, res) {
    const user = await AuthService.login(req.body);
    return sendSuccess(res, user);
  }

  static async requestPasswordReset(req, res) {
    const { email } = req.body;
    const ip = req.ip;
    const result = await AuthService.requestPasswordReset({ email, ip });
    return sendSuccess(res, result);
  }

  static async resetPassword(req, res) {
    const { email, code, newPassword } = req.body;
    const result = await AuthService.resetPassword({ email, code, newPassword });
    return sendSuccess(res, result);
  }

  static async bindEmail(req, res) {
    const { email } = req.body;
    const result = await AuthService.updateProfile(req.userId, { email });
    return sendSuccess(res, result);
  }

  static async changePassword(req, res) {
    const result = await AuthService.changePassword(req.userId, req.body);
    return sendSuccess(res, result);
  }
}
