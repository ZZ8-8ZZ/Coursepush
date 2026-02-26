import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { requireAdmin } from '../middlewares/userContext.js';

const router = Router();

router.get('/me', UserController.getProfile);
router.patch('/me', UserController.updateProfile);
router.delete('/me', UserController.deleteSelf);

// 管理接口
router.get('/', requireAdmin, UserController.listUsers);
router.get('/:id', requireAdmin, UserController.getUserDetail);
router.patch('/:id', requireAdmin, UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);
router.patch('/:id/status', requireAdmin, UserController.updateUserStatus);

export default router;
