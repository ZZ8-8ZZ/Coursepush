import { SemesterModel } from '../models/semesterModel.js';
import { validateSemesterCreate, validateSemesterUpdate } from './validation.js';
import { NotFoundError } from './errors.js';

const ensureSemesterAccessible = async (userId, semesterId) => {
  const semester = await SemesterModel.findById(semesterId);
  if (!semester || semester.userId !== userId) {
    throw new NotFoundError('学期不存在或无权访问');
  }
  return semester;
};

export class SemesterService {
  static async listSemesters(userId) {
    return SemesterModel.listByUser(userId);
  }

  static async createSemester(userId, payload) {
    const data = validateSemesterCreate(payload);
    const semester = await SemesterModel.createSemester({
      userId,
      semesterName: data.semesterName,
      totalWeeks: data.totalWeeks,
      currentWeek: data.currentWeek,
      isActive: data.isActive ?? false,
      status: data.status ?? 'published',
      startDate: data.startDate,
    });
    if (data.isActive) {
      await SemesterModel.setActiveSemester(userId, semester.id);
      return SemesterModel.findById(semester.id);
    }
    return semester;
  }

  static async updateSemester(userId, semesterId, payload) {
    await ensureSemesterAccessible(userId, semesterId);
    const data = validateSemesterUpdate(payload);
    const updated = await SemesterModel.updateSemester(semesterId, data);
    if (data.isActive) {
      await SemesterModel.setActiveSemester(userId, semesterId);
      return SemesterModel.findById(semesterId);
    }
    return updated;
  }

  static async deleteSemester(userId, semesterId) {
    await ensureSemesterAccessible(userId, semesterId);
    await SemesterModel.deleteSemester(semesterId);
  }

  static async setActiveSemester(userId, semesterId) {
    await ensureSemesterAccessible(userId, semesterId);
    await SemesterModel.setActiveSemester(userId, semesterId);
    return SemesterModel.findById(semesterId);
  }
}
