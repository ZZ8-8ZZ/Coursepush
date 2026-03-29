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

  static async sendPush(barkKey, title, body, params = {}) {
    if (!barkKey) {
      throw new Error('Bark key is required');
    }

    const url = new URL(`https://api.day.app/${barkKey}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`);
    
    // Append extra parameters like group, icon, sound, etc.
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Bark API responded with status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to send Bark notification:', error);
      throw error;
    }
  }
}
