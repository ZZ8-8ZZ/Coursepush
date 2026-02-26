import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireUser } from '../middlewares/userContext.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

// 需要登录的认证接口
router.post('/bind-email', requireUser, AuthController.bindEmail);

export default router;
