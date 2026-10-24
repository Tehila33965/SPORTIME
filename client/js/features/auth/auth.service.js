import { request } from '../../shared/http.js';
import { getUser, saveSession, saveUser } from '../../shared/session.js';

// הרשמה: POST /api/users/signup. שולחים רק name, email ו-password
export function signUp({ name, email, password }) {
  return request('/users/signup', { method: 'POST', body: { name, email, password } });
}

// התחברות: POST /api/users/signin. השרת מחזיר { message, token, user }
export async function signIn({ email, password }) {
  const result = await request('/users/signin', { method: 'POST', body: { email, password } });
  saveSession(result.token, result.user);
  return result.user;
}

// עדכון פרופיל של המשתמש המחובר: PUT /api/users/:id
// שימי לב: הסכמה בשרת (userSchema) דורשת גם password, ולכן הבקשה תיכשל עד שיתוקן בשרת
export async function updateProfile({ name, email }) {
  const user = getUser();
  const updated = await request(`/users/${user.id}`, { method: 'PUT', body: { name, email } });
  if (updated) saveUser(updated);
  return updated;
}

// שינוי סיסמה: PATCH /api/users/password/:id עם oldPassword ו-newPassword
export function changePassword({ oldPassword, newPassword }) {
  const user = getUser();
  return request(`/users/password/${user.id}`, { method: 'PATCH', body: { oldPassword, newPassword } });
}
