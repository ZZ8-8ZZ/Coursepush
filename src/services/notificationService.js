import { NotificationLogModel } from '../models/notificationLogModel.js';
import { validateNotificationLog } from './validation.js';

export class NotificationService {
  static async listRecent(userId, limit = 50) {
    return NotificationLogModel.listRecentByUser(userId, limit);
  }

  static async createLog(payload) {
    const data = validateNotificationLog(payload);
    return NotificationLogModel.createLog(data);
  }
}
