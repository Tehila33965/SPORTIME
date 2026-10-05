export const blockingAtCertainDays = (options = {}) => {
    return (req, res, next) => {
        const now = new Date();
        const currentDay = now.getDay();

        // בדיקה האם היום הנוכחי הוא יום 6 או יום שנקבע בפרמטר
        const isBlockedDay = currentDay === 6 || (options.blockedDay !== undefined && currentDay === options.blockedDay);

        if (isBlockedDay) {
            return next({
                status: 403,
                error: new Error('Access is restricted on this specific day.'),
                type: 'Forbidden'
            });
        }

        // אם הכל תקין, ממשיכים הלאה
        next();
    };
};