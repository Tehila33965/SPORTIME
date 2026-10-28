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

// הוספת מאמן חדש באמצעות FormData.
export const addInstructor = (formData) => {
    return request('/instructors', {
        method: 'POST',
        body: formData,
    });
};

// עדכון מאמן קיים באמצעות FormData.
export const updateInstructor = (id, formData) => {
    return request(`/instructors/${id}`, {
        method: 'PUT',
        body: formData,
    });
};

// מחיקת מאמן לפי מזהה.
export const deleteInstructor = (id) => {
    return request(`/instructors/${id}`, {
        method: 'DELETE',
    });
};
