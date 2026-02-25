import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';

const router = Router();

router.get('/logs', NotificationController.listLogs);
router.post('/logs', NotificationController.createLog);

export default router;
