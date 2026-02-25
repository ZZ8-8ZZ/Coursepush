import { AppVersionModel } from '../models/appVersionModel.js';
import { validateAppVersionCreate, validateAppVersionUpdate } from './validation.js';
import { NotFoundError } from './errors.js';

export class AppVersionService {
  static async createVersion(payload) {
    const data = validateAppVersionCreate(payload);
    
    // 如果设置为当前最新版本，需要取消该平台其他版本的当前状态
    const version = await AppVersionModel.createVersion(data);
    if (data.isCurrent) {
      await AppVersionModel.unsetOtherCurrent(data.appPlatform, version.id);
    }
    return version;
  }

  static async updateVersion(id, payload) {
    const data = validateAppVersionUpdate(payload);
    const existing = await AppVersionModel.findById(id);
    if (!existing) {
      throw new NotFoundError('版本记录不存在');
    }

    const updated = await AppVersionModel.updateVersion(id, data);
    
    // 如果更新为当前最新版本，或者平台变更且为当前最新版本
    const platform = data.appPlatform || existing.appPlatform;
    if (data.isCurrent) {
      await AppVersionModel.unsetOtherCurrent(platform, id);
    }
    
    return updated;
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
