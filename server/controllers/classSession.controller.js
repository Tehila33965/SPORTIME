import { ClassSession } from '../models/classSession.model.js';

const getEditableSessionFields = (body) => ({
    classTemplate: body.classTemplate,
    instructor: body.instructor,
    date: body.date,
    time: body.time,
    maxParticipants: body.maxParticipants,
});

const populateOptions = [
    { path: 'classTemplate', select: 'title description category image' },
    { path: 'instructor', select: 'name specialization image' }
];

export const getAllClassSessions = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const filter = {};

        if (req.query.classTemplate) {
            filter.classTemplate = req.query.classTemplate;
        }

        if (req.query.instructor) {
            filter.instructor = req.query.instructor;
        }

        const sessions = await ClassSession.find(filter)
            .populate(populateOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(sessions);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const getClassSession = async (req, res, next) => {
    try {
        const session = await ClassSession.findById(req.params.id);

        if (!session) {
            return next({ status: 404, error: new Error('Class session not found'), type: 'resource not found error' });
        }

        res.json(session);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const addClassSession = async (req, res, next) => {
    try {
        const newSession = new ClassSession({
            ...getEditableSessionFields(req.body),
            registeredCount: 0,
        });
        await newSession.save();

        res.status(201).json(newSession);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const updateClassSession = async (req, res, next) => {
    try {
        const existingSession = await ClassSession.findById(req.params.id);

        if (!existingSession) {
            return next({ status: 404, error: new Error('Class session not found'), type: 'resource not found error' });
        }

        if (req.body.maxParticipants < existingSession.registeredCount) {
            return next({
                status: 400,
                error: new Error('maxParticipants cannot be lower than the number of registered users'),
                type: 'Validation Error',
            });
        }

        const session = await ClassSession.findByIdAndUpdate(
            req.params.id,
            { $set: getEditableSessionFields(req.body) },
            { new: true, runValidators: true }
        );

        if (!session) {
            return next({ status: 404, error: new Error('Class session not found'), type: 'resource not found error' });
        }

        res.json(session);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const deleteClassSession = async (req, res, next) => {
    try {
        const session = await ClassSession.findByIdAndDelete(req.params.id);

        if (!session) {
            return next({ status: 404, error: new Error('Class session not found'), type: 'resource not found error' });
        }

        res.status(204).send();
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};
