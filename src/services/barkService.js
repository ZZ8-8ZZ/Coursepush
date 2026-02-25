import { BarkSettingsModel } from '../models/barkSettingsModel.js';
import { validateBarkSettings } from './validation.js';

export class BarkService {
  static async getSettings(userId) {
    const settings = await BarkSettingsModel.getByUserId(userId);
    if (settings) {
      return settings;
    }
    return {
      userId,
      enabled: false,
      barkKey: null,
      remindMinutesBefore: 15,
      updatedAt: null,
    };
  }

  static async updateSettings(userId, payload) {
    const data = validateBarkSettings(payload);
    return BarkSettingsModel.upsertSettings({
      userId,
      enabled: data.enabled,
      barkKey: data.barkKey ?? null,
      remindMinutesBefore: data.remindMinutesBefore,
    });
  }
}
