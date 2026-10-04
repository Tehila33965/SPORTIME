import Joi from 'joi';

export const instructorSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    specialization: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().min(9).max(15).required(),
    image: Joi.string().uri().allow('').optional()
});