import Joi from 'joi';

export const classSessionSchema = Joi.object({
    classTemplate: Joi.string().hex().length(24).required(),
    instructor: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    maxParticipants: Joi.number().min(5).required(),
    registeredCount: Joi.number().min(0).default(0)
});