export const validate = (schema) => {

    const middleware = (req, res, next) => {

        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');

            return next({
                status: 400,
                error: new Error(errorMessage),
                type: 'Validation Error'
            });
        }

        next();
    };
    return middleware;
};