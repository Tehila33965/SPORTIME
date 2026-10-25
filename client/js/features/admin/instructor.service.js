import { request } from '../../shared/http.js';

// שליפת מאמנים עם אפשרות לסינון/limit.
export const getInstructors = (params = {}) => {
    return request('/instructors', {
        params: {
            limit: 100,
            ...params,
        },
    });
};

// שליפת מאמן בודד לפי מזהה.
export const getInstructor = (id) => {
    return request(`/instructors/${id}`);
};

// הוספת מאמן חדש.
export const addInstructor = (data) => {
    return request('/instructors', {
        method: 'POST',
        body: data,
    });
};

// עדכון פרטי מאמן קיים.
export const updateInstructor = (id, data) => {
    return request(`/instructors/${id}`, {
        method: 'PUT',
        body: data,
    });
};

// מחיקת מאמן לפי מזהה.
export const deleteInstructor = (id) => {
    return request(`/instructors/${id}`, {
        method: 'DELETE',
    });
};
