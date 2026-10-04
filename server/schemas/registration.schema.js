import Joi from 'joi';

export const registrationSchema = Joi.object({
    user: Joi.string().hex().length(24).required(),
    session: Joi.string().hex().length(24).required(),
    status: Joi.string().valid('confirmed', 'cancelled').default('confirmed')
});