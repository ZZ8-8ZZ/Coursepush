import { TimeSlotService } from '../services/timeSlotService.js';
import { sendNoContent, sendSuccess } from '../utils/httpResponses.js';
import { requirePositiveId } from '../utils/controllerUtils.js';

export class TimeSlotController {
  static async listSlots(req, res) {
    const slots = await TimeSlotService.listSlots(req.userId);
    return sendSuccess(res, slots);
  }

  static async createSlot(req, res) {
    const slot = await TimeSlotService.createSlot(req.userId, req.body);
    return sendSuccess(res, slot, { statusCode: 201 });
  }

  static async updateSlot(req, res) {
    const slotId = requirePositiveId(req.params.slotId, 'slotId');
    const slot = await TimeSlotService.updateSlot(req.userId, slotId, req.body);
    return sendSuccess(res, slot);
  }

  static async deleteSlot(req, res) {
    const slotId = requirePositiveId(req.params.slotId, 'slotId');
    await TimeSlotService.deleteSlot(req.userId, slotId);
    return sendNoContent(res);
  }
}
