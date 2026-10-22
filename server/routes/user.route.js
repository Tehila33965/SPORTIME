import { Router } from 'express';
import { getAllUsers, getUser, addUser, updateUser, changePassword, deleteUser, signUp, signIn } from '../controllers/user.controller.js';
import { verifyAuth } from '../middlewares/auth.middleware.js';
import { requireRole, requireSelf, requireSelfOrAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { userSchema, signUpSchema, updateUserSchema, changePasswordSchema, loginSchema } from '../schemas/user.schema.js';
import { blockingAtCertainDays } from '../middlewares/blockingAtCertainDays.middleware.js';
 
const router = Router();
 
// ציבורי
router.post('/signup', blockingAtCertainDays(), validate(signUpSchema), signUp);
router.post('/signin', blockingAtCertainDays(), validate(loginSchema), signIn);
 
// אדמין בלבד
router.get('/', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), getAllUsers);
router.post('/', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), validate(userSchema), addUser);
router.delete('/:id', verifyAuth, requireRole(['admin']), blockingAtCertainDays(), deleteUser);
 
// המשתמש עצמו או אדמין
router.get('/:id', verifyAuth, requireSelfOrAdmin(), blockingAtCertainDays(), getUser);
router.put('/:id', verifyAuth, requireSelfOrAdmin(), blockingAtCertainDays(), validate(updateUserSchema), updateUser);
 
// שינוי סיסמה - המשתמש עצמו בלבד
router.patch('/password/:id', verifyAuth, requireSelf(), blockingAtCertainDays(), validate(changePasswordSchema), changePassword);
 
export default router;
 
