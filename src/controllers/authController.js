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
}
