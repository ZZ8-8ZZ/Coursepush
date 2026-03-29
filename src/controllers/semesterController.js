import { SemesterService } from '../services/semesterService.js';
import { sendNoContent, sendSuccess } from '../utils/httpResponses.js';
import { requirePositiveId } from '../utils/controllerUtils.js';

export class SemesterController {
  static async listSemesters(req, res) {
    const semesters = await SemesterService.listSemesters(req.userId);
    return sendSuccess(res, semesters);
  }

  static async getSemester(req, res) {
    const semesterId = requirePositiveId(req.params.semesterId, 'semesterId');
    const semester = await SemesterService.getSemester(req.userId, semesterId);
    return sendSuccess(res, semester);
  }

  static async createSemester(req, res) {
    const semester = await SemesterService.createSemester(req.userId, req.body);
    return sendSuccess(res, semester, { statusCode: 201 });
  }

  static async updateSemester(req, res) {
    const semesterId = requirePositiveId(req.params.semesterId, 'semesterId');
    const semester = await SemesterService.updateSemester(req.userId, semesterId, req.body);
    return sendSuccess(res, semester);
  }

  static async deleteSemester(req, res) {
    const semesterId = requirePositiveId(req.params.semesterId, 'semesterId');
    await SemesterService.deleteSemester(req.userId, semesterId);
    return sendNoContent(res);
  }

  static async setActiveSemester(req, res) {
    const semesterId = requirePositiveId(req.params.semesterId, 'semesterId');
    const semester = await SemesterService.setActiveSemester(req.userId, semesterId);
    return sendSuccess(res, semester);
  }
}
