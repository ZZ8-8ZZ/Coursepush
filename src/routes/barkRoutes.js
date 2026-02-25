import { Router } from 'express';
import { BarkController } from '../controllers/barkController.js';

const router = Router();

router.get('/settings', BarkController.getSettings);
router.put('/settings', BarkController.updateSettings);

export default router;
