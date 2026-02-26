import { execute, query } from '../config/database.js';
import { mapDbRowToCamelCase } from './modelUtils.js';

export class PasswordResetModel {
  static async createCode({ userId, email, code, expireAt, ip = null }) {
    // 首先标记该用户所有旧验证码为已使用
    await execute(
      'UPDATE password_reset_codes SET is_used = 1 WHERE user_id = ? AND is_used = 0',
      [userId]
    );

    const sql = `
      INSERT INTO password_reset_codes (user_id, email, verify_code, expire_at, ip, created_at)
      VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())
    `;
    const result = await execute(sql, [userId, email, code, expireAt, ip]);

    // 顺便异步清理过期的验证码，保持表整洁
    this.deleteExpiredCodes().catch(err => console.error('Cleanup expired codes failed:', err));

    return result.insertId;
  }

  static async findValidCode(email, code) {
    const sql = `
      SELECT * FROM password_reset_codes 
      WHERE email = ? AND verify_code = ? AND is_used = 0 AND expire_at > UTC_TIMESTAMP()
      ORDER BY created_at DESC LIMIT 1
    `;
    const rows = await query(sql, [email, code]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async markAsUsed(codeId) {
    const sql = 'UPDATE password_reset_codes SET is_used = 1 WHERE id = ?';
    await execute(sql, [codeId]);
  }

  static async deleteExpiredCodes() {
    const sql = 'DELETE FROM password_reset_codes WHERE expire_at <= UTC_TIMESTAMP() OR is_used = 1';
    await execute(sql);
  }

  static async countRecentCodes(userId, seconds = 60) {
    const sql = `
      SELECT COUNT(*) as count FROM password_reset_codes 
      WHERE user_id = ? AND created_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? SECOND)
    `;
    const rows = await query(sql, [userId, seconds]);
    return rows[0].count;
  }

  static async countDailyCodes(userId) {
    const sql = `
      SELECT COUNT(*) as count FROM password_reset_codes 
      WHERE user_id = ? AND created_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)
    `;
    const rows = await query(sql, [userId]);
    return rows[0].count;
  }

  static async countIpDailyCodes(ip) {
    const sql = `
      SELECT COUNT(*) as count FROM password_reset_codes 
      WHERE ip = ? AND created_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)
    `;
    const rows = await query(sql, [ip]);
    return rows[0].count;
  }
}
