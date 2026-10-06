import { Router } from 'express';
import {
    getAllClassSessions,
    getClassSession,
    addClassSession,
    updateClassSession,
    deleteClassSession
} from '../controllers/classSession.controller.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { classSessionSchema } from '../schemas/classSession.schema.js';
import { blockingAtCertainDays } from '../middlewares/blockingAtCertainDays.middleware.js';

const router = Router();

router.get('/', getAllClassSessions, blockingAtCertainDays());
router.get('/:id', getClassSession, blockingAtCertainDays());
router.post('/', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), validate(classSessionSchema), addClassSession);
router.put('/:id', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), validate(classSessionSchema), updateClassSession);
router.delete('/:id', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), deleteClassSession);

export default router;