import { AppVersionModel } from '../models/appVersionModel.js';
import { validateAppVersionCreate, validateAppVersionUpdate } from './validation.js';
import { NotFoundError } from './errors.js';
import { withTransaction } from '../config/database.js';

export class AppVersionService {
  static async createVersion(payload) {
    const data = validateAppVersionCreate(payload);
    
    return await withTransaction(async (connection) => {
      // 如果设置为当前最新版本，需要取消该平台其他版本的当前状态
      // 为了避免触发（即使修改后的）索引冲突，先取消其他的，再插入新的
      if (data.isCurrent) {
        await AppVersionModel.unsetOtherCurrent(data.appPlatform, null, { connection });
      }
      
      return await AppVersionModel.createVersion(data, { connection });
    });
  }

  static async updateVersion(id, payload) {
    const data = validateAppVersionUpdate(payload);
    
    return await withTransaction(async (connection) => {
      const existing = await AppVersionModel.findById(id, { connection });
      if (!existing) {
        throw new NotFoundError('版本记录不存在');
      }

      // 如果更新为当前最新版本，先取消该平台其他版本的当前状态
      const platform = data.appPlatform || existing.appPlatform;
      if (data.isCurrent) {
        await AppVersionModel.unsetOtherCurrent(platform, id, { connection });
      }

      return await AppVersionModel.updateVersion(id, data, { connection });
    });
  }

  static async getLatestVersion(platform) {
    const version = await AppVersionModel.getLatestVersion(platform);
    if (!version) {
      throw new NotFoundError('未找到该平台的版本信息');
    }
    return version;
  }

  static async listVersions(platform, limit, offset) {
    return AppVersionModel.listVersions(platform, limit, offset);
  }

  static async deleteVersion(id) {
    const existing = await AppVersionModel.findById(id);
    if (!existing) {
      throw new NotFoundError('版本记录不存在');
    }
    await AppVersionModel.deleteVersion(id);
  }
}
