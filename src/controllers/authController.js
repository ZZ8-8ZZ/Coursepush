import { AuthService } from '../services/authService.js';
import { sendSuccess } from '../utils/httpResponses.js';

export class AuthController {
  static async register(req, res) {
    const data = await AuthService.register(req.body);
    return sendSuccess(res, data, { statusCode: 201 });
  }

  static async login(req, res) {
    const data = await AuthService.login(req.body);
    return sendSuccess(res, data);
  }

  static async ssoLogin(req, res) {
    const { redirect } = req.query;
    const encoded = AuthService.buildSSOState(redirect);
    const url = AuthService.getSSOAuthorizeUrl(encoded);
    return res.redirect(url);
  }

  static async ssoCallback(req, res) {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }
    const data = await AuthService.handleSSOCallback(code);

    const frontendUrl = AuthService.resolveRedirectUrl(state);
    const redirectUrl = new URL(frontendUrl);
    redirectUrl.searchParams.append('token', data.token);

    return res.redirect(redirectUrl.toString());
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
