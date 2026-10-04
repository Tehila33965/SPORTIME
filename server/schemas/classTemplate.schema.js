import Joi from 'joi';

export const classTemplateSchema = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    category: Joi.string().trim().required(),
    image: Joi.string().allow('').optional()
});