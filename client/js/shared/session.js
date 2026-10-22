// שמירת ההתחברות בדפדפן: הטוקן (לשליחה לשרת) ופרטי המשתמש (להצגה באתר)
import { HOME_PAGE } from '../config.js';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
};

export const isLoggedIn = () => Boolean(getToken());

export const isAdmin = () => getUser()?.role === 'admin';

export const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const saveUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const logout = () => {
    clearSession();
    window.location.href = HOME_PAGE;
};