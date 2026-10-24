// מחזיר את מפתח היום של השיעור, לפי התאריך UTC שבשדה date.
export const dateKey = (session) => {
    const raw = session?.date ?? '';
    return raw.slice(0, 10);
};

// מחזיר Date לפי התאריך של השיעור והשעה, בשעון המקומי של המשתמש.
export const sessionStart = (session) => {
    const key = dateKey(session);
    const time = session?.time ?? '00:00';
    const [hours, minutes] = String(time).split(':').map((part) => Number(part) || 0);
    const [year, month, day] = key.split('-').map(Number);

    return new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0, 0);
};

// מחזיר true אם תחילת השיעור כבר חצתה את השעה הנוכחית.
export const isPast = (session) => sessionStart(session) < new Date();

// ממיינת עותק חדש של השיעורים מהמהיר למאוחר, בלי לשנות את המערך המקורי.
export const sortSessions = (sessions = []) => {
    return [...sessions].sort((a, b) => sessionStart(a) - sessionStart(b));
};

// מקבצת שיעורים לפי תאריך ומסדרת כל יום לפי השעה.
export const groupByDate = (sessions = []) => {
    const ordered = sortSessions(sessions);
    const grouped = new Map();

    ordered.forEach((session) => {
        const key = dateKey(session);

        if (!grouped.has(key)) {
            grouped.set(key, { date: key, sessions: [] });
        }

        grouped.get(key).sessions.push(session);
    });

    return Array.from(grouped.values());
};

// מחזיר את מפתח היום של היום לפי השעה המקומית של המשתמש.
export const todayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// מוסיפה n ימים למפתח יום, כולל ערכים שליליים.
export const addDays = (key, n) => {
    const [year, month, day] = String(key).split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + Number(n || 0));

    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
    const nextDay = String(date.getDate()).padStart(2, '0');

    return `${nextYear}-${nextMonth}-${nextDay}`;
};

// מחזיר תאריך עברית ארוך, כגון 'יום שלישי, 27 באוקטובר', עם UTC.
export const formatDateLong = (key) => {
    const [year, month, day] = String(key).split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat('he-IL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
    }).format(date);
};

// מחזיר שם של יום בעברית בקצרה, לדוגמה 'שלישי'.
export const formatWeekdayShort = (key) => {
    const [year, month, day] = String(key).split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat('he-IL', {
        weekday: 'long',
        timeZone: 'UTC',
    }).format(date);
};

// מחזיר את מספר היום בחודש.
export const formatDayOfMonth = (key) => {
    const [year, month, day] = String(key).split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};

// ממיר שעת שיעור ל-HH:MM עם אפס מוביל, לדוגמה 9:00 -> 09:00.
export const formatTime = (time) => {
    const [hours = 0, minutes = 0] = String(time ?? '00:00').split(':').map(Number);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
