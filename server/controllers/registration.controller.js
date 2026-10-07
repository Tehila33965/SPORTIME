import { Registration } from '../models/registration.model.js';
import { ClassSession } from '../models/classSession.model.js';

export const getAllRegistrations = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const filter = {};

        if (req.query.session) {
            filter.session = req.query.session;
        }

        if (req.query.status) {
            filter.status = { $regex: req.query.status, $options: 'i' };
        }

        const registrations = await Registration.find(filter)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(registrations);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const getRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return next({ status: 404, error: new Error('Registration not found'), type: 'resource not found error' });
        }

        res.json(registration);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const addRegistration = async (req, res, next) => {
    try {
        const newRegistration = new Registration(req.body);
        await newRegistration.save();

        const classSessionId = req.body.session;
        if (classSessionId) {
            await ClassSession.findByIdAndUpdate(classSessionId, { $inc: { registeredCount: 1 } });
        }

        res.status(201).json(newRegistration);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const updateRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!registration) {
            return next({ status: 404, error: new Error('Registration not found'), type: 'resource not found error' });
        }

        res.json(registration);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

export const deleteRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findByIdAndDelete(req.params.id);

        if (!registration) {
            return next({ status: 404, error: new Error('Registration not found'), type: 'resource not found error' });
        }

        const classSessionId = registration.session;
        if (classSessionId) {
            await ClassSession.findByIdAndUpdate(classSessionId, { $inc: { registeredCount: -1 } });
        }

        res.status(204).send();
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};