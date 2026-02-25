import { CourseService } from '../services/courseService.js';
import { sendNoContent, sendSuccess } from '../utils/httpResponses.js';
import { requirePositiveId } from '../utils/controllerUtils.js';
import { toPositiveInteger } from '../utils/parsers.js';

export class CourseController {
  static async listCourses(req, res) {
    const semesterId = requirePositiveId(req.query.semesterId, 'semesterId');
    const filters = {
      semesterId,
      userId: req.userId,
      weekNumber: toPositiveInteger(req.query.weekNumber),
      tagType: req.query.tagType ?? undefined,
    };
    const courses = await CourseService.listCourses(req.userId, filters);
    return sendSuccess(res, courses);
  }

  static async createCourse(req, res) {
    const course = await CourseService.createCourse(req.userId, req.body);
    return sendSuccess(res, course, { statusCode: 201 });
  }

  static async updateCourse(req, res) {
    const courseId = requirePositiveId(req.params.courseId, 'courseId');
    const course = await CourseService.updateCourse(req.userId, courseId, req.body);
    return sendSuccess(res, course);
  }

  static async deleteCourse(req, res) {
    const courseId = requirePositiveId(req.params.courseId, 'courseId');
    await CourseService.deleteCourse(req.userId, courseId);
    return sendNoContent(res);
  }
}
