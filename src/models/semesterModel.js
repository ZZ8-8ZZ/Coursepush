import { execute, query, withTransaction } from '../config/database.js';
import { buildUpdateStatement, mapDbRowToCamelCase, mapRows } from './modelUtils.js';

const semesterColumnMap = {
  semesterName: 'semester_name',
  totalWeeks: 'total_weeks',
  currentWeek: 'current_week',
  isActive: 'is_active',
  status: 'status',
  startDate: 'school_start_date',
};

export class SemesterModel {
  static async createSemester({ userId, semesterName, totalWeeks = 18, currentWeek = 1, isActive = false, status = 'published', startDate }, options = {}) {
    const sql = `
      INSERT INTO semesters (user_id, semester_name, total_weeks, current_week, is_active, status, school_start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await execute(sql, [userId, semesterName, totalWeeks, currentWeek, isActive ? 1 : 0, status, startDate], options);
    return this.findById(result.insertId, options);
  }

  static async findById(semesterId, options = {}) {
    const rows = await query('SELECT * FROM semesters WHERE id = ? LIMIT 1', [semesterId], options);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async listByUser(userId, options = {}) {
    const rows = await query('SELECT * FROM semesters WHERE user_id = ? ORDER BY created_at ASC', [userId], options);
    return mapRows(rows);
  }

  static async updateSemester(semesterId, payload, options = {}) {
    const { clause, values } = buildUpdateStatement(payload, semesterColumnMap);
    const sql = `UPDATE semesters SET ${clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [...values, semesterId], options);
    return this.findById(semesterId, options);
  }

  static async deleteSemester(semesterId, options = {}) {
    await execute('DELETE FROM semesters WHERE id = ?', [semesterId], options);
  }

  static async setActiveSemester(userId, semesterId) {
    return withTransaction(async (connection) => {
      await execute('UPDATE semesters SET is_active = 0 WHERE user_id = ?', [userId], { connection });
      const result = await execute(
        'UPDATE semesters SET is_active = 1 WHERE user_id = ? AND id = ?',
        [userId, semesterId],
        { connection },
      );
      return result.affectedRows === 1;
    });
  }
}
