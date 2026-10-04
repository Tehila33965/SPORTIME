import Joi from 'joi';

export const userSchema = Joi.object({
    name: Joi.string().trim().min(2).max(30).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('client', 'admin').default('client')
});