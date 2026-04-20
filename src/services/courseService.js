import { CourseModel } from '../models/courseModel.js';
import { SemesterModel } from '../models/semesterModel.js';
import { validateCourseCreate, validateCourseFilter, validateCourseUpdate } from './validation.js';
import { NotFoundError } from './errors.js';

const ensureSemesterOwnership = async (userId, semesterId) => {
  const semester = await SemesterModel.findById(semesterId);
  if (!semester || semester.userId !== userId) {
    throw new NotFoundError('学期不存在或无权访问');
  }
  return semester;
};

const ensureCourseOwnership = async (userId, courseId) => {
  const course = await CourseModel.findById(courseId);
  if (!course || course.userId !== userId) {
    throw new NotFoundError('课程不存在或无权访问');
  }
  return course;
};

export class CourseService {
  static async listCourses(userId, filters) {
    const data = validateCourseFilter(filters);
    await ensureSemesterOwnership(userId, data.semesterId);
    return CourseModel.listBySemester({
      semesterId: data.semesterId,
      userId,
      weekNumber: data.weekNumber,
      tagType: data.tagType,
    });
  }

  static async listActiveCourses(userId, filters = {}) {
    const activeSemester = await SemesterModel.findActiveSemester(userId);
    if (!activeSemester) {
      throw new NotFoundError('未找到当前激活的学期');
    }
    const courses = await CourseModel.listBySemester({
      semesterId: activeSemester.id,
      userId,
      weekNumber: filters.weekNumber,
      tagType: filters.tagType,
    });

    return {
      courses,
      currentWeek: activeSemester.currentWeek,
    };
  }

  static async createCourse(userId, payload) {
    const data = validateCourseCreate(payload);
    await ensureSemesterOwnership(userId, data.semesterId);
    return CourseModel.createCourse({
      userId,
      semesterId: data.semesterId,
      name: data.name,
      teacher: data.teacher ?? null,
      location: data.location ?? null,
      dayOfWeek: data.dayOfWeek,
      startPeriod: data.startPeriod,
      endPeriod: data.endPeriod,
      weekPattern: data.weekPattern ?? 'all',
      weekStart: data.weekStart ?? 1,
      weekEnd: data.weekEnd ?? data.weekStart ?? 18,
      tagType: data.tagType ?? 'normal',
      tagName: data.tagName ?? null,
      primaryTagId: data.primaryTagId ?? null,
      notes: data.notes ?? null,
      tagTemplateIds: data.tagTemplateIds ?? [],
    });
  }

  static async updateCourse(userId, courseId, payload) {
    await ensureCourseOwnership(userId, courseId);
    const data = validateCourseUpdate(payload);
    return CourseModel.updateCourse(courseId, data);
  }

  static async deleteCourse(userId, courseId) {
    await ensureCourseOwnership(userId, courseId);
    await CourseModel.deleteCourse(courseId);
  }
}
