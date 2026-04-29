import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { requireUser } from '../middlewares/userContext.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// SSO 登录相关路由
router.get('/sso/login', AuthController.ssoLogin);
router.get('/sso/callback', AuthController.ssoCallback);

router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

// 需要登录的认证接口
router.post('/bind-email', requireUser, AuthController.bindEmail);
router.post('/change-password', requireUser, AuthController.changePassword);

export default router;
