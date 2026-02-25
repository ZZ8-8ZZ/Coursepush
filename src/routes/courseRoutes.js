import { Router } from 'express';
import { CourseController } from '../controllers/courseController.js';

const router = Router();

router.get('/', CourseController.listCourses);
router.post('/', CourseController.createCourse);
router.patch('/:courseId', CourseController.updateCourse);
router.delete('/:courseId', CourseController.deleteCourse);

export default router;
