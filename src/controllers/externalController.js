import { CourseService } from '../services/courseService.js';
import { sendSuccess } from '../utils/httpResponses.js';
import { toPositiveInteger } from '../utils/parsers.js';

export class ExternalController {
  /**
   * 外部调用：查看当前激活学期的课程
   */
  static async getCourses(req, res) {
    const filters = {
      weekNumber: toPositiveInteger(req.query.weekNumber),
      tagType: req.query.tagType ?? undefined,
    };
    
    // req.userId 已由 requireApiKey 中间件设置
    const courses = await CourseService.listActiveCourses(req.userId, filters);
    
    return sendSuccess(res, courses);
  }
}
