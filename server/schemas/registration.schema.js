import Joi from 'joi';

// שדה ה-user הוסר: המשתמש נקבע בשרת לפי הטוקן.
// Joi דוחה שדות לא מוכרים, ולכן בקשה ששולחת user תקבל 400.
export const registrationSchema = Joi.object({
    session: Joi.string().hex().length(24).required(),
    status: Joi.string().valid('confirmed', 'cancelled').default('confirmed')
});