import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import semesterRoutes from './semesterRoutes.js';
import courseRoutes from './courseRoutes.js';
import timeSlotRoutes from './timeSlotRoutes.js';
import tagTemplateRoutes from './tagTemplateRoutes.js';
import barkRoutes from './barkRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import appVersionRoutes from './appVersionRoutes.js';
import externalRoutes from './externalRoutes.js';
import aiRoutes from './aiRoutes.js';
import { requireUser, requireActiveUser } from '../middlewares/userContext.js';

const router = Router();

router.use('/auth', authRoutes);

// 外部调用接口 (使用 API Key 认证)
router.use('/external', externalRoutes);

router.use(requireUser);

// 用户基本信息和管理，修改个人信息需要检查账号状态
router.use('/users', userRoutes);

// 学期、课程、节次管理等需要检查账号状态
router.use('/semesters', requireActiveUser, semesterRoutes);
router.use('/courses', requireActiveUser, courseRoutes);
router.use('/time-slots', requireActiveUser, timeSlotRoutes);
router.use('/tag-templates', requireActiveUser, tagTemplateRoutes);
router.use('/bark', requireActiveUser, barkRoutes);
router.use('/notifications', requireActiveUser, notificationRoutes);
router.use('/app-versions', appVersionRoutes);
router.use('/ai', requireActiveUser, aiRoutes);

export default router;
