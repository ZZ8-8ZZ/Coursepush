import { execute, query } from '../config/database.js';
import { buildUpdateStatement, mapDbRowToCamelCase } from './modelUtils.js';

const userColumnMap = {
  displayName: 'display_name',
  passwordHash: 'password_hash',
  lastLoginAt: 'last_login_at',
};

export class UserModel {
  static async createUser({ username, displayName, passwordHash }) {
    const sql = `
      INSERT INTO users (username, display_name, password_hash)
      VALUES (?, ?, ?)
    `;
    const result = await execute(sql, [username, displayName, passwordHash]);
    return { id: result.insertId, username, displayName };
  }

  static async findById(userId) {
    const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async findByUsername(username) {
    const rows = await query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async updateUser(userId, payload) {
    const { clause, values } = buildUpdateStatement(payload, userColumnMap);
    const sql = `UPDATE users SET ${clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [...values, userId]);
    return this.findById(userId);
  }
}
