import { Router } from 'express';
import { TimeSlotController } from '../controllers/timeSlotController.js';

const router = Router();

router.get('/', TimeSlotController.listSlots);
router.post('/', TimeSlotController.createSlot);
router.patch('/:slotId', TimeSlotController.updateSlot);
router.delete('/:slotId', TimeSlotController.deleteSlot);

export default router;
