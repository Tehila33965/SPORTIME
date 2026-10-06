import { Router } from 'express';
import {
    getAllClassTemplates,
    getClassTemplate,
    addClassTemplate,
    updateClassTemplate,
    deleteClassTemplate
} from '../controllers/classTemplate.controller.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { classTemplateSchema } from '../schemas/classTemplate.schema.js';
import { blockingAtCertainDays } from '../middlewares/blockingAtCertainDays.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', getAllClassTemplates, blockingAtCertainDays());
router.get('/:id', getClassTemplate, blockingAtCertainDays());
router.post('/', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), upload.single('image'), validate(classTemplateSchema), addClassTemplate);
router.put('/:id', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), upload.single('image'), validate(classTemplateSchema), updateClassTemplate);
router.delete('/:id', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), deleteClassTemplate);

export default router;