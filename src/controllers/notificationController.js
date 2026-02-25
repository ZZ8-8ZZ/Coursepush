import { NotificationService } from '../services/notificationService.js';
import { sendSuccess } from '../utils/httpResponses.js';
import { toPositiveInteger } from '../utils/parsers.js';

export class NotificationController {
  static async listLogs(req, res) {
    const limit = toPositiveInteger(req.query.limit) ?? 50;
    const logs = await NotificationService.listRecent(req.userId, limit);
    return sendSuccess(res, logs, { meta: { limit } });
  }

  static async createLog(req, res) {
    const payload = {
      ...req.body,
      userId: req.body.userId ?? req.userId,
    };
    const log = await NotificationService.createLog(payload);
    return sendSuccess(res, log, { statusCode: 201 });
  }
}
