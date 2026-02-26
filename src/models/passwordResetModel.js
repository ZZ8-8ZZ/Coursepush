import { execute, query } from '../config/database.js';
import { mapDbRowToCamelCase } from './modelUtils.js';

export class PasswordResetModel {
  static async createCode({ userId, email, code, expireAt, ip }) {
    // 首先标记该用户所有旧验证码为已使用
    await execute(
      'UPDATE password_reset_codes SET is_used = 1 WHERE user_id = ? AND is_used = 0',
      [userId]
    );

    const sql = `
      INSERT INTO password_reset_codes (user_id, email, verify_code, expire_at, ip)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await execute(sql, [userId, email, code, expireAt, ip]);
    return result.insertId;
  }

  static async findValidCode(email, code) {
    const sql = `
      SELECT * FROM password_reset_codes 
      WHERE email = ? AND verify_code = ? AND is_used = 0 AND expire_at > NOW()
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
    const sql = 'DELETE FROM password_reset_codes WHERE expire_at <= NOW() OR is_used = 1';
    await execute(sql);
  }
}
