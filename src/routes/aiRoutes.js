import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';

const router = Router();

// 所有 AI 接口都需要登录
router.post('/analysis', aiController.getWeeklyAnalysis);
router.post('/chat', aiController.chat);

export default router;
