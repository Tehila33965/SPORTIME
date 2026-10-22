import { Router } from 'express';
import {
    getAllInstructors,
    getInstructorsBySpecialization,
    getInstructorById,
    addInstructor,
    updateInstructor,
    deleteInstructor
} from '../controllers/instructor.controller.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { instructorSchema } from '../schemas/instructor.schema.js';
import { blockingAtCertainDays } from '../middlewares/blockingAtCertainDays.middleware.js';

const router = Router();

router.get('/', blockingAtCertainDays(), getAllInstructors);
router.get('/specialization/:specialization', blockingAtCertainDays(), getInstructorsBySpecialization);
router.get('/:id', blockingAtCertainDays(), getInstructorById);
router.post('/', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), validate(instructorSchema), addInstructor);
router.put('/:id', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), validate(instructorSchema), updateInstructor);
router.delete('/:id', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), deleteInstructor);

export default router;