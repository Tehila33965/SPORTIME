import { LOGIN_PAGE, CLIENT_HOME, ADMIN_HOME } from '../config.js';
import { isLoggedIn, isAdmin } from './session.js';

// מחייב התחברות ושומר את הכתובת הנוכחית להמשך.
export const requireLogin = () => {
    if (!isLoggedIn()) {
        const next = window.location.pathname + window.location.search;
        window.location.replace(`${LOGIN_PAGE}?next=${encodeURIComponent(next)}`);
        return false;
    }

    return true;
};

// מחייב התחברות והרשאת מנהל.
export const requireAdmin = () => {
    if (!isLoggedIn()) {
        const next = window.location.pathname + window.location.search;
        window.location.replace(`${LOGIN_PAGE}?next=${encodeURIComponent(next)}`);
        return false;
    }

    if (!isAdmin()) {
        window.location.replace(CLIENT_HOME);
        return false;
    }

    return true;
};

// מפנה משתמש מחובר לדף הבית המתאים.
export const redirectIfLoggedIn = () => {
    if (!isLoggedIn()) {
        return false;
    }

    window.location.replace(isAdmin() ? ADMIN_HOME : CLIENT_HOME);
    return true;
};
