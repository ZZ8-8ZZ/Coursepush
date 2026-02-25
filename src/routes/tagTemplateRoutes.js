import { Router } from 'express';
import { TagTemplateController } from '../controllers/tagTemplateController.js';

const router = Router();

router.get('/', TagTemplateController.listTemplates);
router.post('/', TagTemplateController.createTemplate);
router.patch('/:tagId', TagTemplateController.updateTemplate);
router.delete('/:tagId', TagTemplateController.deleteTemplate);

export default router;
