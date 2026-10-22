export const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return next({
                status: 401,
                error: new Error('User not authenticated'),
                type: 'authentication error'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next({
                status: 403,
                error: new Error('User does not have the required role'),
                type: 'authorization error'
            });
        }
        next();
    };
};
 
// מאפשר גישה רק למשתמש עצמו (ה-id בנתיב שווה ל-id שבטוקן), או לאדמין
export const requireSelfOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return next({
                status: 401,
                error: new Error('User not authenticated'),
                type: 'authentication error'
            });
        }
 
        const isAdmin = req.user.role === 'admin';
        const isSelf = String(req.user.userId) === req.params[paramName];
 
        if (!isAdmin && !isSelf) {
            return next({
                status: 403,
                error: new Error('You can only access your own account'),
                type: 'authorization error'
            });
        }
        next();
    };
};
 
// מאפשר גישה רק למשתמש עצמו, בלי יוצא מן הכלל (למשל שינוי סיסמה)
export const requireSelf = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return next({
                status: 401,
                error: new Error('User not authenticated'),
                type: 'authentication error'
            });
        }
 
        if (String(req.user.userId) !== req.params[paramName]) {
            return next({
                status: 403,
                error: new Error('You can only change your own password'),
                type: 'authorization error'
            });
        }
        next();
    };
};
