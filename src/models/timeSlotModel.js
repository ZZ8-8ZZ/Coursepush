import { execute, query } from '../config/database.js';
import { buildUpdateStatement, mapDbRowToCamelCase, mapRows } from './modelUtils.js';

const timeSlotColumnMap = {
  periodOrder: 'period_order',
  startTime: 'start_time',
  endTime: 'end_time',
};

export class TimeSlotModel {
  static async listByUser(userId, options = {}) {
    const rows = await query(
      'SELECT * FROM time_slots WHERE user_id = ? ORDER BY period_order ASC',
      [userId],
      options,
    );
    return mapRows(rows);
  }

  static async createTimeSlot({ userId, periodOrder, startTime, endTime }, options = {}) {
    const sql = `
      INSERT INTO time_slots (user_id, period_order, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(sql, [userId, periodOrder, startTime, endTime], options);
    return this.findById(result.insertId, options);
  }

  static async findById(slotId, options = {}) {
    const rows = await query('SELECT * FROM time_slots WHERE id = ? LIMIT 1', [slotId], options);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async updateTimeSlot(slotId, payload, options = {}) {
    const { clause, values } = buildUpdateStatement(payload, timeSlotColumnMap);
    const sql = `UPDATE time_slots SET ${clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [...values, slotId], options);
    return this.findById(slotId, options);
  }

  static async deleteTimeSlot(slotId, options = {}) {
    await execute('DELETE FROM time_slots WHERE id = ?', [slotId], options);
  }
}
