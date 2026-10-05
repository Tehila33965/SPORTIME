import { ClassSession } from '../models/classSession.model.js';

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
        const newSession = new ClassSession(req.body);
        await newSession.save();

        res.status(201).json(newSession);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const updateClassSession = async (req, res, next) => {
    try {
        const session = await ClassSession.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
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
