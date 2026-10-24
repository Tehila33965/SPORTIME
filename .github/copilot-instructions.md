# הנחיות לפרויקט SPORTIME (צד לקוח)

אתר להרשמה לשיעורים במכון כושר. הקליינט נכתב ב-HTML, CSS ו-JavaScript רגיל (ES modules), בלי frameworks ובלי כלי build. השרת (Express) מגיש את התיקייה client כקבצים סטטיים וה-API נמצא תחת /api. כשמבקשים ממך לכתוב קוד, עקוב אחרי הכללים האלה.

## כללי קוד
- כל דף HTML: lang="he" dir="rtl", meta viewport, גופן Heebo מ-Google Fonts (כמו ב-client/index.html), קישור ל-styles.css ולקובץ ה-CSS של ה-feature, וסקריפט אחד מסוג module.
- בתוך דפי HTML נתיבי קבצים הם יחסיים (למשל ../../js/features/auth/login.page.js). נתיבי ניווט בתוך קוד JS הם מוחלטים מהשורש (למשל /pages/auth/login.html) והם מוגדרים ב-js/config.js.
- תגיות סמנטיות: header, main, section, nav, form. לכל input יש label. כפתור שליחה הוא button מסוג submit. משתמשים בתכונות HTML לבדיקות תקינות (required, type, minlength, pattern).
- בלי style inline ובלי onclick בתוך ה-HTML. אירועים מחוברים ב-JS. CSS בקבצים נפרדים בתיקיית client/css, עם משתני :root מ-styles.css (--ink, --muted, --paper, --lime, --deep).
- תצוגה רספונסיבית שעובדת גם ברוחב 400px, בלי גלילה אופקית בדף.
- פניות לשרת רק דרך קבצי *.service.js, שקוראים לפונקציה request מ-js/shared/http.js. אין fetch ישיר בדפים.
- רכיבים חוזרים (כרטיס שיעור, שורה ברשימה) הם פונקציות שמחזירות אלמנט DOM, בתיקיית components של ה-feature. טקסט שמגיע מהשרת מוכנס עם textContent, לא עם innerHTML.
- כל הטקסטים למשתמש בעברית, בניסוח ניטרלי למגדר (למשל "התחברות", "נרשמת").
- שגיאות והודעות מוצגות בתוך הדף. אין alert, confirm או prompt. לאישור פעולה (מחיקה, ביטול) משתמשים ב-confirmDialog מ-js/shared/modal.js.
- הערות בעברית, קצרות, רק איפה שזה לא מובן מהקוד.
- לא לשנות קבצים שלא הוזכרו בבקשה. אם חסר קובץ שהבקשה תלויה בו, תגיד לי במקום להמציא אותו.

## מבנה התיקיות
client/index.html, client/styles.css, client/css/ (קובץ לכל feature), client/pages/שם-ה-feature/*.html, client/js/config.js, client/js/shared/, client/js/features/שם-ה-feature/ (service, page, components). ה-features: auth, classes, registrations, admin.

## מודולים קיימים (client/js)
- config.js: API_BASE_URL, LOGIN_PAGE, HOME_PAGE, CLIENT_HOME, ADMIN_HOME, CLASS_PRICE.
- shared/session.js: getToken, getUser, isLoggedIn, isAdmin, saveSession, saveUser, clearSession, logout. getUser() מחזיר { id, name, email, role } או null.
- shared/http.js: request(path, { method, body, params }) מחזיר את ה-JSON (או null ב-204). זורק ApiError עם message בעברית, status ו-type. ב-401 עם טוקן מנקה את ההתחברות ומפנה להתחברות.
- shared/guard.js: requireLogin(), requireAdmin(), redirectIfLoggedIn(). כל אחת מחזירה true או false, ומפנה כשצריך. בדף משתמשים כך: if (requireLogin()) { init(); }
- shared/header.js: mountHeader() בונה את התפריט העליון בתוך header עם id="site-header".
- shared/format.js: dateKey(session), sessionStart(session), isPast(session), sortSessions(sessions), groupByDate(sessions), todayKey(), addDays(key, n), formatDateLong(key), formatWeekdayShort(key), formatDayOfMonth(key), formatTime(time). מפתח יום (key) הוא מחרוזת בצורה YYYY-MM-DD.
- shared/dom.js: createEl(tag, options, ...children), showLoading(container, text), showError(container, error), showEmpty(container, text), showFormError(form, message), setFieldError(input, message), clearFormErrors(form).
- shared/modal.js: confirmDialog({ title, text, confirmLabel, cancelLabel }) מחזיר Promise של true או false.
- features/auth/auth.service.js: signUp, signIn, updateProfile, changePassword.
- features/classes/classSession.service.js: getClassSessions(params), getClassSession(id).
- features/registrations/registration.service.js: getMyRegistrations(params), registerToSession(sessionId), cancelRegistration(registrationId).

## צורת הנתונים מהשרת (כל אובייקט עם id ולא _id)
- שיעור: { id, classTemplate, instructor, date, time, maxParticipants, registeredCount }. ברשימה (getClassSessions) classTemplate הוא { id, title, description, category, image } ו-instructor הוא { id, name, specialization, image }. בשיעור בודד (getClassSession) שני אלה הם מזהים בלבד.
- date היא מחרוזת ISO של חצות UTC של היום שנבחר, ומציגים אותה עם timeZone UTC. time היא "HH:MM".
- הרשמה: { id, user, session, status }, כש-session הוא מזהה בלבד.
- מאמן: { id, name, specialization, email, phone, image }. תבנית שיעור: { id, title, description, category, image }.
- משתמש: { id, name, email, role }, ו-role הוא client או admin.

## חוקי השרת שחשוב לזכור
- ברשימות ברירת המחדל היא 10 תוצאות, לכן תמיד שולחים limit: 100.
- השרת לא ממיין ולא מסנן לפי תאריך. ממיינים ומסננים בקליינט.
- שיעור עבר כשהתאריך והשעה שלו קטנים מעכשיו. שיעור מתקיים רק אם נרשמו אליו לפחות 5. שיעור מלא כש-registeredCount גדול או שווה ל-maxParticipants.
- ב-POST וב-PUT השרת בודק את הנתונים עם Joi, שדוחה שדות לא מוכרים (400). שולחים רק את השדות שהסכמה מצפה להם.
- בשבת כל בקשה מחזירה 403, והשגיאה מתורגמת ל"האתר סגור בשבת". מציגים אותה בדף.
