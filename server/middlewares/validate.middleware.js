export const validate = (schema) => {

    const middleware = (req, res, next) => {

        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');

            return next({
                status: 400,
                error: new Error(errorMessage),
                type: 'Validation Error'
            });
        }
        req.body = value;
        
        next();
    };
    return middleware;
};