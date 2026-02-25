import { execute, query } from '../config/database.js';
import { buildUpdateStatement, mapDbRowToCamelCase } from './modelUtils.js';

const appVersionColumnMap = {
  appPlatform: 'app_platform',
  versionCode: 'version_code',
  versionName: 'version_name',
  downloadUrl: 'download_url',
  updateDesc: 'update_desc',
  isForce: 'is_force',
  isCurrent: 'is_current',
};

export class AppVersionModel {
  static async createVersion(data, options = {}) {
    const sql = `
      INSERT INTO app_version (
        app_platform, version_code, version_name, download_url, 
        update_desc, is_force, is_current
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await execute(sql, [
      data.appPlatform,
      data.versionCode,
      data.versionName,
      data.downloadUrl,
      data.updateDesc || '',
      data.isForce ? 1 : 0,
      data.isCurrent ? 1 : 0,
    ], options);
    return { id: result.insertId, ...data };
  }

  static async getLatestVersion(platform, options = {}) {
    const sql = `
      SELECT * FROM app_version 
      WHERE app_platform = ? AND is_current = 1 
      LIMIT 1
    `;
    const rows = await query(sql, [platform], options);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async findById(id, options = {}) {
    const rows = await query('SELECT * FROM app_version WHERE id = ? LIMIT 1', [id], options);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async listVersions(platform, limit = 20, offset = 0, options = {}) {
    const safeLimit = Math.max(1, Number(limit) || 20);
    const safeOffset = Math.max(0, Number(offset) || 0);
    
    let sql = 'SELECT * FROM app_version';
    const params = [];
    if (platform) {
      sql += ' WHERE app_platform = ?';
      params.push(platform);
    }
    sql += ` ORDER BY version_code DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    const rows = await query(sql, params, options);
    return rows.map(mapDbRowToCamelCase);
  }

  static async updateVersion(id, payload, options = {}) {
    const { clause, values } = buildUpdateStatement(payload, appVersionColumnMap);
    if (!clause) return this.findById(id, options);
    const sql = `UPDATE app_version SET ${clause}, update_time = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [...values, id], options);
    return this.findById(id, options);
  }

  static async unsetOtherCurrent(platform, excludeId, options = {}) {
    let sql = `
      UPDATE app_version 
      SET is_current = 0 
      WHERE app_platform = ? AND is_current = 1
    `;
    const params = [platform];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    await execute(sql, params, options);
  }

  static async deleteVersion(id, options = {}) {
    await execute('DELETE FROM app_version WHERE id = ?', [id], options);
  }
}
