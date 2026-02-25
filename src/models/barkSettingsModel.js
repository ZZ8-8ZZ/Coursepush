import { execute, query } from '../config/database.js';
import { mapDbRowToCamelCase } from './modelUtils.js';

export class BarkSettingsModel {
  static async getByUserId(userId, options = {}) {
    const rows = await query('SELECT * FROM bark_settings WHERE user_id = ? LIMIT 1', [userId], options);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async upsertSettings({ userId, enabled, barkKey, remindMinutesBefore }, options = {}) {
    const sql = `
      INSERT INTO bark_settings (user_id, enabled, bark_key, remind_minutes_before)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        enabled = VALUES(enabled),
        bark_key = VALUES(bark_key),
        remind_minutes_before = VALUES(remind_minutes_before),
        updated_at = CURRENT_TIMESTAMP
    `;
    await execute(sql, [userId, enabled ? 1 : 0, barkKey ?? null, remindMinutesBefore], options);
    return this.getByUserId(userId, options);
  }
}
