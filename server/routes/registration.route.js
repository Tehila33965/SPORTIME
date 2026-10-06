import { Router } from "express";
import { getAllRegistrations, getRegistration, addRegistration, updateRegistration, deleteRegistration } from '../controllers/registration.controller.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { validate } from "../middlewares/validate.middleware.js";
import { registrationSchema } from '../schemas/registration.schema.js';
import { blockingAtCertainDays } from '../middlewares/blockingAtCertainDays.middleware.js';

const router = Router();

router.get('/', blockingAtCertainDays(), getAllRegistrations);
router.get('/:id', blockingAtCertainDays(), getRegistration);
router.post('/', verifyAuth, blockingAtCertainDays(), validate(registrationSchema), addRegistration);
router.put('/:id', verifyAuth, blockingAtCertainDays(), validate(registrationSchema), updateRegistration);
router.delete('/:id', verifyAuth, blockingAtCertainDays(), deleteRegistration);

export default router;