import { Instructor } from '../models/instructor.model.js';

// שליפת כל המאמנים (כולל תמיכה ב-Pagination וחיפוש לפי שם/התמחות)
export const getAllInstructors = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 10;
        const filter = {};

        // חיפוש לפי שם אם הועבר ב-Query Parameters
        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: 'i' };
        }

        const instructors = await Instructor.find(filter)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(instructors);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
}

// שליפת מאמנים לפי התמחות ספציפית
export const getInstructorsBySpecialization = async (req, res, next) => {
    try {
        const { specialization } = req.params;
        const instructors = await Instructor.find({
            specialization: { $regex: specialization, $options: 'i' }
        });

        res.json(instructors);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
}

// שליפת מאמן בודד לפי ID
export const getInstructorById = async (req, res, next) => {
    try {
        const instructor = await Instructor.findById(req.params.id);

        if (!instructor) {
            return next({ status: 404, error: new Error('The instructor is not found'), type: 'resource not found error' });
        }

        res.json(instructor);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

// הוספת מאמן חדש
export const addInstructor = async (req, res, next) => {
    try {
        const newInstructor = new Instructor(req.body);
        await newInstructor.save();

        res.status(201).json(newInstructor);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

// עדכון פרטי מאמן
export const updateInstructor = async (req, res, next) => {
    try {
        const instructor = await Instructor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!instructor) {
            return next({ status: 404, error: new Error('The instructor is not found'), type: 'resource not found error' });
        }

        res.json(instructor);
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};

// מחיקת מאמן
export const deleteInstructor = async (req, res, next) => {
    try {
        const instructor = await Instructor.findByIdAndDelete(req.params.id);

        if (!instructor) {
            return next({ status: 404, error: new Error('The instructor is not found'), type: 'resource not found error' });
        }

        res.status(204).send();
    }
    catch (error) {
        next({ status: 500, error: new Error('Server Error'), type: 'server error' });
    }
};


