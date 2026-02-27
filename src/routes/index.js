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
import { requireUser, requireActiveUser } from '../middlewares/userContext.js';

const router = Router();

router.use('/auth', authRoutes);

router.use(requireUser);
router.use('/users', userRoutes);

// 学期和课程管理需要检查账号状态
router.use('/semesters', requireActiveUser, semesterRoutes);
router.use('/courses', requireActiveUser, courseRoutes);

router.use('/time-slots', timeSlotRoutes);
router.use('/tag-templates', tagTemplateRoutes);
router.use('/bark', barkRoutes);
router.use('/notifications', notificationRoutes);
router.use('/app-versions', appVersionRoutes);

export default router;
