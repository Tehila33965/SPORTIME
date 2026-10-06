import { Router } from 'express';
import { getAllUsers, getUser, addUser, updateUser, changePassword, deleteUser, signUp, signIn } from '../controllers/user.controller.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { userSchema, loginSchema } from '../schemas/user.schema.js';
import { blockingAtCertainDays } from '../middlewares/blockingAtCertainDays.middleware.js';

const router = Router();

router.post('/signup', blockingAtCertainDays(), validate(userSchema), signUp);
router.post('/signin', blockingAtCertainDays(), validate(loginSchema), signIn);
router.get('/', blockingAtCertainDays(), getAllUsers);
router.get('/:id', blockingAtCertainDays(), getUser);
router.post('/', verifyAuth, blockingAtCertainDays(), validate(userSchema), addUser);
router.put('/:id', verifyAuth, blockingAtCertainDays(), validate(userSchema), updateUser);
router.patch('/password/:id', verifyAuth, blockingAtCertainDays(), changePassword);
router.delete('/:id', verifyAuth, blockingAtCertainDays(), deleteUser);

export default router;