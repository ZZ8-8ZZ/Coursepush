import { execute, query } from '../config/database.js';
import { buildUpdateStatement, mapDbRowToCamelCase } from './modelUtils.js';

const userColumnMap = {
  displayName: 'display_name',
  email: 'email',
  passwordHash: 'password_hash',
  lastLoginAt: 'last_login_at',
  isActive: 'is_active',
  role: 'role',
};

export class UserModel {
  static async createUser({ username, displayName, email, passwordHash }) {
    const sql = `
      INSERT INTO users (username, display_name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(sql, [username, displayName, email, passwordHash]);
    return { id: result.insertId, username, displayName, email };
  }

  static async findById(userId) {
    const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async findAll({ query: search, page = 1, pageSize = 20 } = {}) {
    const offset = (page - 1) * pageSize;
    let sql = 'SELECT * FROM users';
    const params = [];

    if (search) {
      sql += ' WHERE username LIKE ? OR display_name LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const rows = await query(sql, params);
    return rows.map(mapDbRowToCamelCase);
  }

  static async countAll({ query: search } = {}) {
    let sql = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (search) {
      sql += ' WHERE username LIKE ? OR display_name LIKE ?';
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    const rows = await query(sql, params);
    return rows[0].total;
  }

  static async deleteUser(userId) {
    await execute('DELETE FROM users WHERE id = ?', [userId]);
  }

  static async findByUsername(username) {
    const rows = await query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async updatePassword(userId, passwordHash) {
    const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await execute(sql, [passwordHash, userId]);
  }

  static async updateUser(userId, payload) {
    const { clause, values } = buildUpdateStatement(payload, userColumnMap);
    const sql = `UPDATE users SET ${clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [...values, userId]);
    return this.findById(userId);
  }
}
