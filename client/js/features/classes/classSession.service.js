// פעולות מול השרת: שיעורים (התבנית והמאמן כבר מצורפים בתשובה)
import { request } from '../../shared/http.js';

// params אופציונלי: { page, limit, classTemplate, instructor }
export const getClassSessions = (params) => request('/classSessions', { params });

export const getClassSession = (id) => request(`/classSessions/${id}`);