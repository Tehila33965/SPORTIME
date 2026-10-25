import { request } from '../../shared/http.js';

// שליפת שיעורים עם אפשרות לסינון ו-limit.
export const getClassSessions = (params = {}) => {
    return request('/classSessions', {
        params: {
            limit: 100,
            ...params,
        },
    });
};

// שליפת שיעור לפי מזהה.
export const getClassSession = (id) => {
    return request(`/classSessions/${id}`);
};

// הוספת שיעור חדש.
export const addClassSession = (data) => {
    return request('/classSessions', {
        method: 'POST',
        body: data,
    });
};

// עדכון שיעור קיים.
export const updateClassSession = (id, data) => {
    return request(`/classSessions/${id}`, {
        method: 'PUT',
        body: data,
    });
};

// מחיקת שיעור לפי מזהה.
export const deleteClassSession = (id) => {
    return request(`/classSessions/${id}`, {
        method: 'DELETE',
    });
};