import { Router } from 'express';
import { UserController } from '../controllers/userController.js';

const router = Router();

router.get('/me', UserController.getProfile);
router.patch('/me', UserController.updateProfile);

export default router;
