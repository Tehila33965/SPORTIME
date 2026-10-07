export const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return next({
                status: 401,
                error: new Error('User not authenticated'),
                type: 'authentication error'
            })
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next({
                status: 403,
                error: new Error('User does not have the required role'),
                type: 'authorization error'
            });
        }
        next();
    }
}