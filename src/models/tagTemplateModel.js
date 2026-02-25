import { execute, query } from '../config/database.js';
import { buildUpdateStatement, mapDbRowToCamelCase, mapRows } from './modelUtils.js';

const tagColumnMap = {
  type: 'type',
  label: 'label',
  description: 'description',
};

export class TagTemplateModel {
  static async listByUser(userId, options = {}) {
    const rows = await query('SELECT * FROM tag_templates WHERE user_id = ? ORDER BY created_at ASC', [userId], options);
    return mapRows(rows);
  }

  static async findById(tagId, options = {}) {
    const rows = await query('SELECT * FROM tag_templates WHERE id = ? LIMIT 1', [tagId], options);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async findByLabel(userId, label, options = {}) {
    const rows = await query(
      'SELECT * FROM tag_templates WHERE user_id = ? AND label = ? LIMIT 1',
      [userId, label],
      options,
    );
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async createTagTemplate({ userId, type, label, description }, options = {}) {
    const sql = `
      INSERT INTO tag_templates (user_id, type, label, description)
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(sql, [userId, type, label, description ?? null], options);
    return this.findById(result.insertId, options);
  }

  static async updateTagTemplate(tagId, payload, options = {}) {
    const { clause, values } = buildUpdateStatement(payload, tagColumnMap);
    const sql = `UPDATE tag_templates SET ${clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [...values, tagId], options);
    return this.findById(tagId, options);
  }

  static async deleteTagTemplate(tagId, options = {}) {
    await execute('DELETE FROM tag_templates WHERE id = ?', [tagId], options);
  }
}
