import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const verifyAuth = (req, res, next) => {
    try {
        // 1. שליפת כותרת ה-Authorization מהבקשה
        const authHeader = req.headers.authorization;

        // בדיקה שהכותרת קיימת ומתחילה ב-Bearer
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next({
                status: 401,
                error: new Error('Access denied. No token provided.'),
                type: 'Unauthorized'
            });
        }

        // 2. חילוץ מחרוזת הטוקן עצמה (הסרת המילה 'Bearer ')
        const token = authHeader.split(' ')[1];

        // 3. אימות קריפטוגרפי של הטוקן מול המפתח הסודי
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // 4. הצמדת נתוני המשתמש (userId ו-role) אל אובייקט ה-req 
        // כדי שהקונטרולר הבא בשרשרת יוכל להשתמש בהם
        req.user = decoded;

        // 5. הכל תקין - ממשיכים הלאה לקונטרולר
        next();
    } 
    catch (error) {
        // אם הטוקן פג תוקף, מזויף או לא תקין
        return next({
            status: 401,
            error: new Error('Invalid or expired token'),
            type: 'Unauthorized'
        });
    }
};