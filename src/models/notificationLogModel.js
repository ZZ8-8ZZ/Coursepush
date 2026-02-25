import { execute, query } from '../config/database.js';
import { mapDbRowToCamelCase, mapRows } from './modelUtils.js';

export class NotificationLogModel {
  static async createLog({ userId, courseId, status, detail, scheduledFor }, options = {}) {
    const sql = `
      INSERT INTO notification_logs (user_id, course_id, status, detail, scheduled_for)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await execute(sql, [userId, courseId ?? null, status, detail, scheduledFor ?? null], options);
    return this.findById(result.insertId, options);
  }

  static async findById(logId, options = {}) {
    const rows = await query('SELECT * FROM notification_logs WHERE id = ? LIMIT 1', [logId], options);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async listRecentByUser(userId, limit = 50, options = {}) {
    // Validate userId
    if (!userId || typeof userId !== 'number' || userId <= 0) {
      throw new Error('Invalid userId: must be a positive number');
    }
    
    // Validate limit
    const validLimit = Number(limit);
    if (Number.isNaN(validLimit) || validLimit <= 0) {
      throw new Error('Invalid limit: must be a positive number');
    }
    
    const rows = await query(
      'SELECT * FROM notification_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, validLimit],
      options,
    );
    return mapRows(rows);
  }
}
