import { Router } from "express";
import classSessionRouter from './classSession.route.js';
import classTemplateRouter from './classTemplate.route.js';
import instructorRouter from './instructor.route.js';
import registrationRouter from './registration.route.js';
import userRouter from './user.route.js';

const router = Router();

router.use('/classSessions', classSessionRouter);
router.use('/classTemplates', classTemplateRouter);
router.use('/instructors', instructorRouter);
router.use('/registrations', registrationRouter);
router.use('/users', userRouter);

export default router;