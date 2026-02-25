import { BarkService } from '../services/barkService.js';
import { sendSuccess } from '../utils/httpResponses.js';

export class BarkController {
  static async getSettings(req, res) {
    const settings = await BarkService.getSettings(req.userId);
    return sendSuccess(res, settings);
  }

  static async updateSettings(req, res) {
    const settings = await BarkService.updateSettings(req.userId, req.body);
    return sendSuccess(res, settings);
  }
}
