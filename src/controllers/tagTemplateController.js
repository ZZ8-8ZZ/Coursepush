import { TagTemplateService } from '../services/tagTemplateService.js';
import { sendNoContent, sendSuccess } from '../utils/httpResponses.js';
import { requirePositiveId } from '../utils/controllerUtils.js';

export class TagTemplateController {
  static async listTemplates(req, res) {
    const templates = await TagTemplateService.listTemplates(req.userId);
    return sendSuccess(res, templates);
  }

  static async createTemplate(req, res) {
    const template = await TagTemplateService.createTemplate(req.userId, req.body);
    return sendSuccess(res, template, { statusCode: 201 });
  }

  static async updateTemplate(req, res) {
    const tagId = requirePositiveId(req.params.tagId, 'tagId');
    const template = await TagTemplateService.updateTemplate(req.userId, tagId, req.body);
    return sendSuccess(res, template);
  }

  static async deleteTemplate(req, res) {
    const tagId = requirePositiveId(req.params.tagId, 'tagId');
    await TagTemplateService.deleteTemplate(req.userId, tagId);
    return sendNoContent(res);
  }
}
