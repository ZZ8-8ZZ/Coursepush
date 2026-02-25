import { Router } from 'express';
import { AppVersionController } from '../controllers/appVersionController.js';

const router = Router();

// 获取最新版本信息（无需登录即可获取，方便 App 启动时检查）
router.get('/latest', AppVersionController.getLatestVersion);

// 以下接口通常需要管理员权限，目前共用 requireUser 中间件
router.get('/', AppVersionController.listVersions);
router.post('/', AppVersionController.createVersion);
router.patch('/:versionId', AppVersionController.updateVersion);
router.delete('/:versionId', AppVersionController.deleteVersion);

export default router;
