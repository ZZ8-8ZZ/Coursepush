import { TagTemplateModel } from '../models/tagTemplateModel.js';
import { validateTagTemplateCreate, validateTagTemplateUpdate } from './validation.js';
import { ConflictError, NotFoundError } from './errors.js';

const ensureTemplateOwnership = async (userId, tagId) => {
  const template = await TagTemplateModel.findById(tagId);
  if (!template || template.userId !== userId) {
    throw new NotFoundError('标签模板不存在或无权访问');
  }
  return template;
};

export class TagTemplateService {
  static async listTemplates(userId) {
    return TagTemplateModel.listByUser(userId);
  }

  static async createTemplate(userId, payload) {
    const data = validateTagTemplateCreate(payload);
    const existing = await TagTemplateModel.findByLabel(userId, data.label);
    if (existing) {
      throw new ConflictError('存在同名标签模板');
    }
    return TagTemplateModel.createTagTemplate({
      userId,
      type: data.type ?? 'normal',
      label: data.label,
      description: data.description ?? null,
    });
  }

  static async updateTemplate(userId, tagId, payload) {
    await ensureTemplateOwnership(userId, tagId);
    const data = validateTagTemplateUpdate(payload);
    if (data.label) {
      const duplicate = await TagTemplateModel.findByLabel(userId, data.label);
      if (duplicate && duplicate.id !== tagId) {
        throw new ConflictError('存在同名标签模板');
      }
    }
    return TagTemplateModel.updateTagTemplate(tagId, data);
  }

  static async deleteTemplate(userId, tagId) {
    await ensureTemplateOwnership(userId, tagId);
    await TagTemplateModel.deleteTagTemplate(tagId);
  }
}
