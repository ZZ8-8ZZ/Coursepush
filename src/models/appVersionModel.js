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
  static async createVersion(data) {
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
    ]);
    return { id: result.insertId, ...data };
  }

  static async getLatestVersion(platform) {
    const sql = `
      SELECT * FROM app_version 
      WHERE app_platform = ? AND is_current = 1 
      LIMIT 1
    `;
    const rows = await query(sql, [platform]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM app_version WHERE id = ? LIMIT 1', [id]);
    return rows.length ? mapDbRowToCamelCase(rows[0]) : null;
  }

  static async listVersions(platform, limit = 20, offset = 0) {
    let sql = 'SELECT * FROM app_version';
    const params = [];
    if (platform) {
      sql += ' WHERE app_platform = ?';
      params.push(platform);
    }
    sql += ' ORDER BY version_code DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const rows = await query(sql, params);
    return rows.map(mapDbRowToCamelCase);
  }

  static async updateVersion(id, payload) {
    const { clause, values } = buildUpdateStatement(payload, appVersionColumnMap);
    if (!clause) return this.findById(id);
    const sql = `UPDATE app_version SET ${clause}, update_time = CURRENT_TIMESTAMP WHERE id = ?`;
    await execute(sql, [...values, id]);
    return this.findById(id);
  }

  static async unsetOtherCurrent(platform, excludeId) {
    const sql = `
      UPDATE app_version 
      SET is_current = 0 
      WHERE app_platform = ? AND id != ? AND is_current = 1
    `;
    await execute(sql, [platform, excludeId]);
  }

  static async deleteVersion(id) {
    await execute('DELETE FROM app_version WHERE id = ?', [id]);
  }
}
