import { Router } from 'express';
import { ExternalController } from '../controllers/externalController.js';
import { requireApiKey } from '../middlewares/userContext.js';

const router = Router();

// 所有外部接口都需要 API Key
router.use(requireApiKey);

/**
 * @route GET /api/v1/external/courses
 * @desc 获取当前激活学期的课程列表
 */
router.get('/courses', ExternalController.getCourses);

export default router;
