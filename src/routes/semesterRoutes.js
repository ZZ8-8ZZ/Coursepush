import { Router } from 'express';
import { SemesterController } from '../controllers/semesterController.js';

const router = Router();

router.get('/', SemesterController.listSemesters);
router.get('/:semesterId', SemesterController.getSemester);
router.post('/', SemesterController.createSemester);
router.patch('/:semesterId', SemesterController.updateSemester);
router.delete('/:semesterId', SemesterController.deleteSemester);
router.post('/:semesterId/activate', SemesterController.setActiveSemester);

export default router;
