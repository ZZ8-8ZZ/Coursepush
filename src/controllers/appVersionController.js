import { AppVersionService } from '../services/appVersionService.js';
import { sendSuccess } from '../utils/httpResponses.js';
import { toPositiveInteger } from '../utils/parsers.js';

export class AppVersionController {
  static async createVersion(req, res) {
    const version = await AppVersionService.createVersion(req.body);
    return sendSuccess(res, version, { statusCode: 201 });
  }

  static async updateVersion(req, res) {
    const { versionId } = req.params;
    const version = await AppVersionService.updateVersion(versionId, req.body);
    return sendSuccess(res, version);
  }

  static async getLatestVersion(req, res) {
    const { platform } = req.query;
    const version = await AppVersionService.getLatestVersion(platform);
    return sendSuccess(res, version);
  }

  static async listVersions(req, res) {
    const platform = toPositiveInteger(req.query.platform);
    const limit = toPositiveInteger(req.query.limit) ?? 20;
    const offset = toPositiveInteger(req.query.offset) ?? 0;
    const versions = await AppVersionService.listVersions(platform, limit, offset);
    return sendSuccess(res, versions, { meta: { platform, limit, offset } });
  }

  static async deleteVersion(req, res) {
    const { versionId } = req.params;
    await AppVersionService.deleteVersion(versionId);
    return sendSuccess(res, { message: '删除成功' });
  }
}
