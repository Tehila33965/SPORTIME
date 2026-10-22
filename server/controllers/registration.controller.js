import { Registration } from '../models/registration.model.js';
import { ClassSession } from '../models/classSession.model.js';
 
const isAdmin = (user) => user.role === 'admin';
 
// אדמין רשאי לגשת לכל הרשמה, משתמש רגיל רק להרשמות שלו
const canAccess = (registration, user) =>
    isAdmin(user) || String(registration.user) === String(user.userId);
 
const forbidden = (next) =>
    next({ status: 403, error: new Error('You can only access your own registrations'), type: 'authorization error' });
 
export const getAllRegistrations = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const filter = {};
 
        // משתמש רגיל רואה רק את ההרשמות של עצמו
        if (!isAdmin(req.user)) {
            filter.user = req.user.userId;
        }
 
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
 
        if (!canAccess(registration, req.user)) {
            return forbidden(next);
        }
 
        res.json(registration);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};
 
export const addRegistration = async (req, res, next) => {
    try {
        const newRegistration = new Registration({
            user: req.user.userId, // verifyAuth שומר את פרטי המשתמש ב-req.user
            session: req.body.session,
        });
        await newRegistration.save();
 
        await ClassSession.findByIdAndUpdate(newRegistration.session, { $inc: { registeredCount: 1 } });
 
        res.status(201).json(newRegistration);
    }
    catch (error) {
        // מונע הרשמה כפולה של משתמש לאותה סשן
        if (error.code === 11000) {
            return next({ status: 409, error: new Error('User is already registered for this session'), type: 'conflict' });
        }
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};
 
export const updateRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findById(req.params.id);
 
        if (!registration) {
            return next({ status: 404, error: new Error('Registration not found'), type: 'resource not found error' });
        }
 
        if (!canAccess(registration, req.user)) {
            return forbidden(next);
        }
 
        // מעדכנים רק את הסטטוס. שינוי session דרך כאן היה מבלבל את מונה הנרשמים
        if (req.body.status) {
            registration.status = req.body.status;
        }
        await registration.save();
 
        res.json(registration);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};
 
export const deleteRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findById(req.params.id);
 
        if (!registration) {
            return next({ status: 404, error: new Error('Registration not found'), type: 'resource not found error' });
        }
 
        if (!canAccess(registration, req.user)) {
            return forbidden(next);
        }
 
        await registration.deleteOne();
 
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
 