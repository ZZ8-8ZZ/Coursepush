import { TimeSlotModel } from '../models/timeSlotModel.js';
import { validateTimeSlotCreate, validateTimeSlotUpdate } from './validation.js';
import { ConflictError, NotFoundError } from './errors.js';

const ensureSlotOwnership = async (userId, slotId) => {
  const slot = await TimeSlotModel.findById(slotId);
  if (!slot || slot.userId !== userId) {
    throw new NotFoundError('节次不存在或无权访问');
  }
  return slot;
};

const assertPeriodAvailability = (existingSlots, periodOrder, slotId = null) => {
  if (typeof periodOrder !== 'number') {
    return;
  }
  const conflict = existingSlots.find((slot) => slot.periodOrder === periodOrder && slot.id !== slotId);
  if (conflict) {
    throw new ConflictError(`第 ${periodOrder} 节已存在`);
  }
};

export class TimeSlotService {
  static async listSlots(userId) {
    return TimeSlotModel.listByUser(userId);
  }

  static async createSlot(userId, payload) {
    const data = validateTimeSlotCreate(payload);
    const existingSlots = await TimeSlotModel.listByUser(userId);
    assertPeriodAvailability(existingSlots, data.periodOrder);
    return TimeSlotModel.createTimeSlot({
      userId,
      periodOrder: data.periodOrder,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  }

  static async updateSlot(userId, slotId, payload) {
    const slot = await ensureSlotOwnership(userId, slotId);
    const data = validateTimeSlotUpdate(payload);
    const existingSlots = await TimeSlotModel.listByUser(userId);
    assertPeriodAvailability(existingSlots, data.periodOrder, slot.id);
    return TimeSlotModel.updateTimeSlot(slotId, data);
  }

  static async deleteSlot(userId, slotId) {
    await ensureSlotOwnership(userId, slotId);
    await TimeSlotModel.deleteTimeSlot(slotId);
  }
}
