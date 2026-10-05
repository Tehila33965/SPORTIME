export const validate = (schema) => {

    const middleware = (req, res, next) => {

        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');

            const validationError = new Error(errorMessage);
            validationError.status = 400;
            validationError.type = 'Validation Error';

            return next(validationError);
        }

        next();
    };
    return middleware;
};