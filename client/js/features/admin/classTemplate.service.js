import { request } from '../../shared/http.js';

// שליפת תבניות שיעור עם אפשרות לסינון/limit.
export const getClassTemplates = (params = {}) => {
    return request('/classTemplates', {
        params: {
            limit: 100,
            ...params,
        },
    });
};

// שליפת תבנית לפי מזהה.
export const getClassTemplate = (id) => {
    return request(`/classTemplates/${id}`);
};

// הוספת תבנית חדשה באמצעות FormData.
export const addClassTemplate = (formData) => {
    return request('/classTemplates', {
        method: 'POST',
        body: formData,
    });
};

// עדכון תבנית קיימת באמצעות FormData.
export const updateClassTemplate = (id, formData) => {
    return request(`/classTemplates/${id}`, {
        method: 'PUT',
        body: formData,
    });
};

// מחיקת תבנית לפי מזהה.
export const deleteClassTemplate = (id) => {
    return request(`/classTemplates/${id}`, {
        method: 'DELETE',
    });
};
