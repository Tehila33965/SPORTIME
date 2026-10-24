// =========================================================================
// קובץ תקשורת מרכזי (HTTP Client)
// תפקידו: לרכז את כל הקריאות לשרת (fetch), להוסיף טוקן, לבנות URL ולתרגם שגיאות.
// =========================================================================

// ייבוא קבועים של נתיבים מרכזיים מקובץ הקונפיגורציה
import { API_BASE_URL, LOGIN_PAGE } from '../config.js';

// ייבוא פונקציות לניהול ניתוק וזיהוי הטוקן מקובץ ה-session
import { getToken, clearSession } from '../session.js';

// מילון מונחים: תרגום שגיאות נפוצות שחוזרות מהשרת באנגלית להודעות ברורות בעברית
const ERROR_MESSAGES_HE = {
    'Access is restricted on this specific day.': 'האתר סגור בשבת',
    'Invalid email or password': 'אימייל או סיסמה שגויים',
    'Email already exists': 'האימייל הזה כבר רשום במערכת',
    'User is already registered for this session': 'כבר קיימת הרשמה לשיעור הזה',
    'Incorrect old password': 'הסיסמה הישנה שגויה',
    'Invalid or expired token': 'פג תוקף ההתחברות, יש להתחבר מחדש',
    'Access denied. No token provided.': 'יש להתחבר כדי לבצע פעולה זו',
    'Server Error': 'שגיאה בשרת, נסו שוב בעוד רגע'
};

/**
 * מחלקת שגיאה מותאמת אישית יורשת מחלקת Error הרגילה.
 * מתרגמת אוטומטית את הודעת השגיאה לעברית בעזרת המילון.
 */
export class ApiError extends Error {
    constructor(status, type, serverMessage) {
        // אם יש תרגום בעברית להודעה מהשרת משתמשים בו, אחרת מציגים את ההודעה המקורית
        super(ERROR_MESSAGES_HE[serverMessage] || serverMessage);
        this.name = 'ApiError';
        this.status = status;  // קוד השגיאה (לדוגמה: 401, 404, 500)
        this.type = type;      // סוג השגיאה (לדוגמה: 'network error', 'validation error')
    }
}

/**
 * פונקציית הבקשות המרכזית - כל בקשה לשרת מהפרויקט עוברת דרכה.
 * @param {string} path - נתיב הקריאה בשרת, למשל '/classSessions'
 * @param {object} options - אובייקט הגדרות הבקשה: method (שיטה), body (תוכן), params (פרמטרים ל-URL)
 */
export async function request(path, { method = 'GET', body, params } = {}) {
    
    // 1. בניית כתובת ה-URL המלאה
    const url = new URL(API_BASE_URL + path, window.location.href);
    
    // אם נשלחו פרמטרים ב-params (כמו ?page=1&limit=10), מוסיפים אותם ל-URL
    Object.entries(params || {}).forEach(([key, value]) => {
        // מדלגים על פרמטרים שאין בהם ערך כדי לשמור על URL נקי
        if (value !== undefined && value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });

    // 2. הכנת כותרות הבקשה (Headers)
    const headers = {};
    
    // אם המשתמש מחובר ויש טוקן ב-localStorage, מוסיפים אותו לכותרת האימות
    const token = getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    // אם נשלח מידע בגוף הבקשה, מציינים לשרת שהפורמט הוא JSON, אלא כשמדובר ב-FormData
    if (body !== undefined && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // 3. ביצוע קריאת ה-fetch לשרת
    let response;
    try {
        response = await fetch(url, {
            method,
            headers,
            // המרת אובייקט ה-JS למחרוזת JSON לפני השליחה, אלא כשמדובר ב-FormData
            body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined
        });
    } catch {
        // במידה והשרת כבוי או שאין חיבור אינטרנט
        throw new ApiError(0, 'network error', 'אין חיבור לשרת');
    }

    // 4. טיפול בתשובה מוצלחת ללא תוכן (קוד HTTP 204 - למשל בעת מחיקה)
    if (response.status === 204) {
        return null;
    }

    // ניסיון לפענח את התשובה מפורמט JSON
    const data = await response.json().catch(() => null);

    // 5. טיפול בשגיאות שהוחזרו מהשרת (כאשר response.ok הוא false)
    if (!response.ok) {
        // במידה והשרת החזיר 401 (לא מורשה) והיה טוקן בבקשה - פג תוקף ההתחברות
        if (response.status === 401 && token) {
            clearSession(); // מנקים את נתוני התחברות
            window.location.href = LOGIN_PAGE; // מעבירים את המשתמש לעמוד ההתחברות
        }
        
        // זריקת שגיאה מסודרת עם הפרטים שהתקבלו מהשרת
        throw new ApiError(
            response.status,
            data?.error?.type || 'server error',
            data?.error?.message || 'Something went wrong'
        );
    }

    // החזרת הנתונים שחזרו מהשרת במידה והכל עבר בהצלחה
    return data;
}