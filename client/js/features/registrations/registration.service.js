// פעולות מול השרת: הרשמות לשיעורים
import { request } from '../../shared/http.js';

// השרת מחזיר רק את ההרשמות של המשתמשת המחוברת (אדמין רואה הכול)
export const getMyRegistrations = (params) => request('/registrations', { params });

export const getSessionRegistrations = async (sessionId, params = {}) =>
    request('/registrations', {
        params: {
            session: sessionId,
            limit: 100,
            ...params,
        },
    });

export const getUserById = (userId) => request(`/users/${userId}`);

export const registerToSession = (sessionId) =>
    request('/registrations', { method: 'POST', body: { session: sessionId } });

// ביטול הרשמה (מוחק אותה ומעדכן את מונה הנרשמים)
export const cancelRegistration = (registrationId) =>
    request(`/registrations/${registrationId}`, { method: 'DELETE' });